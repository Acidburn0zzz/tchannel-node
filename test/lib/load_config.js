// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var extendInto = require('xtend/mutable');
var fs = require('fs');

var extractParts = require('../../lib/part-list.js').extractParts;

module.exports = combineConfig;

function combineConfig(configPath) {
    var config = {};
    var paths = configPaths(configPath);
    for (var i = 0; i < paths.length; i++) {
        var contents = fs.readFileSync(paths[i], 'utf8');
        var partConfig = JSON.parse(contents);
        extendInto(config, partConfig);
    }
    return config;
}

function configPaths(configPath) {
    var parts = extractParts(configPath);
    var results = [];
    buildPart('', 0, function each(str) {
        results.push(str);
    });

    return results;

    function buildPart(prefix, i, emit) {
        var part = parts[i];
        if (!part) {
            emit(prefix);
            return;
        }
        part.each(function eachSubPart(str) {
            buildPart(prefix + str, i + 1, emit);
        });
    }
}
