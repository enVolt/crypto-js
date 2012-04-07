YUI.add('algo-rc4-test', function (Y) {
    var C = CryptoJS;

    Y.Test.Runner.add(new Y.Test.Case({
        name: 'RC4',

        testVector1: function () {
            Y.Assert.areEqual('7494c2e7104b0879', C.RC4.encrypt(C.enc.Hex.parse('0000000000000000'), C.enc.Hex.parse('0123456789abcdef')).ciphertext);
        },

        testVector2: function () {
            Y.Assert.areEqual('f13829c9de', C.RC4.encrypt(C.enc.Hex.parse('dcee4cf92c'), C.enc.Hex.parse('618a63d2fb')).ciphertext);
        },

        testDrop: function () {
            Y.Assert.areEqual(
                C.RC4.encrypt(C.enc.Hex.parse('00000000000000000000000000000000'), C.enc.Hex.parse('0123456789abcdef')).ciphertext.toString().substr(16),
                C.RC4.Drop.encrypt(C.enc.Hex.parse('0000000000000000'), C.enc.Hex.parse('0123456789abcdef'), { drop: 2 }).ciphertext
            );
        },

        testMultiPart: function () {
            var rc4 = C.algo.RC4.createEncryptor(C.enc.Hex.parse('0123456789abcdef'));
            var ciphertext1 = rc4.process(C.enc.Hex.parse('00000000'));
            var ciphertext2 = rc4.process(C.enc.Hex.parse('0000'));
            var ciphertext3 = rc4.process(C.enc.Hex.parse('0000'));
            var ciphertext4 = rc4.finalize();

            Y.Assert.areEqual('7494c2e7104b0879', ciphertext1.concat(ciphertext2).concat(ciphertext3).concat(ciphertext4));
        },

        testInputIntegrity: function () {
            var message = C.enc.Hex.parse('0000000000000000');
            var key = C.enc.Hex.parse('0123456789abcdef');

            var expectedMessage = message.toString();
            var expectedKey = key.toString();

            C.RC4.encrypt(message, key);

            Y.Assert.areEqual(expectedMessage, message);
            Y.Assert.areEqual(expectedKey, key);
        },

        testHelper: function () {
            // Save original random method
            var random = C.lib.WordArray.random;

            // Replace random method with one that returns a predictable value
            C.lib.WordArray.random = function (nBytes) {
                var words = [];
                for (var i = 0; i < nBytes; i += 4) {
                    words.push([0x11223344]);
                }

                return C.lib.WordArray.create(words, nBytes);
            };

            // Test
            Y.Assert.areEqual(C.algo.RC4.createEncryptor(C.SHA256('Jefe')).finalize('Hi There').toString(), C.RC4.encrypt('Hi There', C.SHA256('Jefe')).ciphertext);
            Y.Assert.areEqual(C.lib.Cipher.Serializable.encrypt(C.algo.RC4, 'Hi There', C.SHA256('Jefe')).toString(), C.RC4.encrypt('Hi There', C.SHA256('Jefe')));
            Y.Assert.areEqual(C.lib.Cipher.PBE.encrypt(C.algo.RC4, 'Hi There', 'Jefe').toString(), C.RC4.encrypt('Hi There', 'Jefe'));

            // Restore random method
            C.lib.WordArray.random = random;
        }
    }));
}, '$Rev$');