import { dotnet, exit } from './dotnet.js'

function add(a, b) {
    return a + b;
}

function sub(a, b) {
    return a - b;
}

try {
    const { runtimeBuildInfo, setModuleImports, getAssemblyExports, runMain, getConfig } = await dotnet
        .withConsoleForwarding()
        .withElementOnExit()
        .withModuleConfig({
            // This whole 'withModuleConfig' is for demo purposes only.
            // It is prefered to use specific 'with***' methods instead. 
            // Only when such method is doesn't exist, fallback to moduleConfig.

            configSrc: "./mono-config.json",
            onConfigLoaded: (config) => {
                // This is called during emscripten `dotnet.wasm` instantiation, after we fetched config.
                console.log('user code Module.onConfigLoaded');
                // config is loaded and could be tweaked before the rest of the runtime startup sequence
                config.environmentVariables["MONO_LOG_LEVEL"] = "debug"
            },
            preInit: () => { console.log('user code Module.preInit'); },
            preRun: () => { console.log('user code Module.preRun'); },
            onRuntimeInitialized: () => {
                console.log('user code Module.onRuntimeInitialized');
                // here we could use API passed into this callback
                // Module.FS.chdir("/");
            },
            onDotnetReady: () => {
                // This is called after all assets are loaded.
                console.log('user code Module.onDotnetReady');
            },
            postRun: () => { console.log('user code Module.postRun'); },
        })
        .create();


    // at this point both emscripten and monoVM are fully initialized.
    console.log('user code after dotnet.create');
    setModuleImports("main.js", {
        Sample: {
            Test: {
                add,
                sub
            }
        }
    });

    const config = getConfig();
    const exports = await getAssemblyExports(config.mainAssemblyName);
    const meaning = exports.Sample.Test.TestMeaning();
    console.debug(`meaning: ${meaning}`);
    if (!exports.Sample.Test.IsPrime(meaning)) {
        document.getElementById("out").innerHTML = `${meaning} as computed on dotnet ver ${runtimeBuildInfo.productVersion}`;
        console.debug(`ret: ${meaning}`);
    }

    let exit_code = await runMain(config.mainAssemblyName, []);
    exit(exit_code);
}
catch (err) {
    exit(2, err);
}