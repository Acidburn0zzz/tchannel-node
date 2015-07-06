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

var LENGTH_ARRAYS = {};

function TChannelStatsd(channel, statsd) {
    if (!(this instanceof TChannelStatsd)) {
        return new TChannelStatsd(channel, statsd);
    }

    var self = this;
    self.statsd = statsd;
    self.channel = channel;

    self.channel.statEvent.on(onStat);

    function onStat(stat) {
        self.onStat(stat);
    }
}

function clean(str, field) {
    var copy;

    if (!str) {
        return field;
    }

    copy = LENGTH_ARRAYS[str.length];
    if (!copy) {
        copy = LENGTH_ARRAYS[str.length] = [];
    }

    for (var i = 0; i < str.length; i++) {
        var char = str[i];

        if (char === ':' ||
            char === '/' ||
            char === '.' ||
            char === '{' ||
            char === '}'
        ) {
            copy[i] = '-';
        } else {
            copy[i] = char;
        }
    }

    return copy.join('');
}

function cleanHostPort(str, field) {
    var copy;

    if (!str) {
        return field;
    }

    var length = str.indexOf(':');

    copy = LENGTH_ARRAYS[length];
    if (!copy) {
        copy = LENGTH_ARRAYS[length] = [];
    }
    for (var i = 0; i < length; i++) {
        var char = str[i];

        if (char === '/' ||
            char === '.' ||
            char === '{' ||
            char === '}'
        ) {
            copy[i] = '-';
        } else {
            copy[i] = char;
        }
    }

    return copy.join('');
}

function getKey(stat) {
    /*eslint complexity: [2, 50]*/
    var prefix = 'tchannel.' + stat.name;
    switch (stat.name) {
        // outbound
        case 'outbound.calls.sent':
            return prefix + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags['target-service'], 'no-target-service') + '.' +
                clean(stat.tags['target-endpoint'], 'no-endpoint');

        case 'outbound.calls.success':
            return prefix + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags['target-service'], 'no-target-service') + '.' +
                clean(stat.tags['target-endpoint'], 'no-endpoint');

        case 'outbound.calls.system-errors':
            return prefix + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags['target-service'], 'no-target-service') + '.' +
                clean(stat.tags['target-endpoint'], 'no-endpoint') + '.' +
                clean(stat.tags.type, 'no-type');

        case 'outbound.calls.per-attempt.system-errors':
            return prefix + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags['target-service'], 'no-target-service') + '.' +
                clean(stat.tags['target-endpoint'], 'no-endpoint') + '.' +
                clean(stat.tags.type, 'type') + '.' +
                stat.tags['retry-count'];

        case 'outbound.calls.operational-errors':
            return prefix + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags['target-service'], 'no-target-service') + '.' +
                clean(stat.tags['target-endpoint'], 'no-endpoint') + '.' +
                clean(stat.tags.type, 'no-type');

        case 'outbound.calls.per-attempt.operational-errors':
            return prefix + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags['target-service'], 'no-target-service') + '.' +
                clean(stat.tags['target-endpoint'], 'no-endpoint') + '.' +
                clean(stat.tags.type, 'type') + '.' +
                stat.tags['retry-count'];

        case 'outbound.calls.app-errors':
            return prefix + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags['target-service'], 'no-target-service') + '.' +
                clean(stat.tags['target-endpoint'], 'no-endpoint') + '.' +
                clean(stat.tags.type, 'no-type');

        case 'outbound.calls.per-attempt.app-errors':
            return prefix + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags['target-service'], 'no-target-service') + '.' +
                clean(stat.tags['target-endpoint'], 'no-endpoint') + '.' +
                clean(stat.tags.type, 'type') + '.' +
                stat.tags['retry-count'];

        case 'outbound.calls.retries':
            return prefix + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags['target-service'], 'no-target-service') + '.' +
                clean(stat.tags['target-endpoint'], 'no-endpoint') + '.' +
                stat.tags['retry-count'];

        case 'outbound.request.size':
            return prefix + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags.targetService, 'no-target-service') + '.' +
                clean(stat.tags.targetEndpoint, 'no-endpoint');

        case 'outbound.response.size':
            return prefix + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags['target-service'], 'no-target-service') + '.' +
                clean(stat.tags['target-endpoint'], 'no-endpoint');

        case 'outbound.calls.latency':
            return prefix + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags['target-service'], 'no-target-service') + '.' +
                clean(stat.tags['target-endpoint'], 'no-endpoint');

        case 'outbound.calls.per-attempt-latency':
            return prefix + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags['target-service'], 'no-target-service') + '.' +
                clean(stat.tags['target-endpoint'], 'no-endpoint') + '.' +
                stat.tags['retry-count'];

        // inbound
        case 'inbound.calls.recvd':
            return prefix + '.' +
                clean(stat.tags.callingService, 'no-calling-service') + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags.endpoint, 'no-endpoint');

        case 'inbound.calls.success':
            return prefix + '.' +
                clean(stat.tags['calling-service'], 'no-calling-service') + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags.endpoint, 'no-endpoint');

        case 'inbound.calls.system-errors':
            return prefix + '.' +
                clean(stat.tags['calling-service'], 'no-calling-service') + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags.endpoint, 'no-endpoint') + '.' +
                clean(stat.tags.type, 'no-type');

        case 'inbound.calls.app-errors':
            return prefix + '.' +
                clean(stat.tags['calling-service'], 'no-calling-service') + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags.endpoint, 'no-endpoint') + '.' +
                clean(stat.tags.type, 'no-type');

        case 'inbound.request.size':
            return prefix + '.' +
                clean(stat.tags.callingService, 'no-calling-service') + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags.endpoint, 'no-endpoint');

        case 'inbound.response.size':
            return prefix + '.' +
                clean(stat.tags['calling-service'], 'no-calling-service') + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags.endpoint, 'no-endpoint');

        case 'inbound.protocol-errors':
            return prefix + '.' +
                cleanHostPort(stat.tags['peer-host-port'], 'peer-host-port');

        case 'inbound.calls.latency':
            return prefix + '.' +
                clean(stat.tags['calling-service'], 'no-calling-service') + '.' +
                clean(stat.tags.service, 'no-service') + '.' +
                clean(stat.tags.endpoint, 'no-endpoint');

        // connection
        case 'connections.active':
            return prefix + '.' +
                cleanHostPort(stat.tags['peer-host-port'], 'no-peer-host-port');

        case 'connections.initiated':
            return prefix + '.' +
                cleanHostPort(stat.tags['peer-host-port'], 'no-peer-host-port');

        case 'connections.connect-errors':
            return prefix + '.' +
                cleanHostPort(stat.tags['peer-host-port'], 'no-peer-host-port');

        case 'connections.accepted':
            return prefix + '.' +
                cleanHostPort(stat.tags['peer-host-port'], 'no-peer-host-port');

        case 'connections.accept-errors':
            return prefix + '.' +
                cleanHostPort(stat.tags['host-port'], 'no-host-port');

        case 'connections.errors':
            return prefix + '.' +
                cleanHostPort(stat.tags['peer-host-port'], 'no-peer-host-port') + '.' +
                clean(stat.tags.type, 'no-type');

        case 'connections.closed':
            return prefix + '.' +
                cleanHostPort(stat.tags['peer-host-port'], 'no-peer-host-port') + '.' +
                clean(stat.tags.reason, 'no-reason');

        case 'connections.bytes-sent':
            return prefix + '.' +
                cleanHostPort(stat.tags.peerHostPort, 'no-peer-host-port');

        case 'connections.bytes-recvd':
            return prefix + '.' +
                cleanHostPort(stat.tags.peerHostPort, 'no-peer-host-port');

        // other types
        default:
            return 'tchannel.bad-stat-object';
    }
}

TChannelStatsd.prototype.onStat = function onStat(stat) {
    var self = this;

    var key = getKey(stat);

    if (stat.type === 'counter') {
        return self.statsd.increment(key, stat.value);
    } else if (stat.type === 'gauge') {
        return self.statsd.gauge(key, stat.value);
    } else if (stat.type === 'timing') {
        return self.statsd.timing(key, stat.value);
    } else {
        self.channel.logger.error('Trying to emit an invalid stat object', {
            statType: stat.type,
            statName: stat.name
        });
    }
};

module.exports = TChannelStatsd;
