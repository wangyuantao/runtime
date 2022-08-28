// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.

using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Runtime;
using Xunit;

namespace Microsoft.Extensions.Configuration.Binder.Test
{
    public class ConfigurationCollectionBinding
    {
        [Fact]
        public void BindStringDictionaryLarge()
        {
            var configurationBuilder = new ConfigurationBuilder();
            for (int j = 0; j < 500; j++)
            {
                var input = Enumerable.Range(0, 500).ToDictionary(i => $"key{i}_{j}", i => $"val{i}_{j}");
                configurationBuilder.AddInMemoryCollection(input);
            }
            var config = configurationBuilder.Build();

            var options = new Dictionary<string, string>();
            config.Bind(options);
            Assert.Equal(10000, options.Count);
        }
    }
}
