/*
 Copyright 2018 IBM All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the 'License');
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
		http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an 'AS IS' BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
/*
 * Enroll the admin user
 */

'use strict';

var Fabric_Client = require('fabric-client');
var Fabric_CA_Client = require('fabric-ca-client');

var path = require('path');
var fabric_client = new Fabric_Client();
var fabric_ca_client = null;
var admin_user = null;
// var member_user = null;
var store_path = path.join(__dirname, 'hfc-key-store');
console.log(' Store path:' + store_path);

// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
Fabric_Client.newDefaultKeyValueStore({
  path: store_path
}).then((state_store) => {
  // assign the store to the fabric client
  fabric_client.setStateStore(state_store);
  var crypto_suite = Fabric_Client.newCryptoSuite();
  // use the same location for the state store (where the users' certificate are kept)
  // and the crypto store (where the users' keys are kept)
  var crypto_store = Fabric_Client.newCryptoKeyStore({ path: store_path });
  crypto_suite.setCryptoKeyStore(crypto_store);
  fabric_client.setCryptoSuite(crypto_suite);
  // be sure to change the http to https when the CA is running TLS enabled
  fabric_ca_client = new Fabric_CA_Client('https://admin:5b2267ca69@n0737b98744f146609edec1a6b4f92b75-org1-ca.us05.blockchain.ibm.com:31011',
   null ,'org1CA', crypto_suite);
  // first check to see if the admin is already enrolled
  return fabric_client.getUserContext('admin', true);
}).then((user_from_store) => {
  if (user_from_store && user_from_store.isEnrolled()) {
    console.log('Successfully loaded admin from persistence');
    admin_user = user_from_store;
    return null;
  } else {
    // need to enroll it with CA server
    return fabric_ca_client.enroll({
      enrollmentID: 'admin',
      enrollmentSecret: '5b2267ca69'
    }).then((enrollment) => {
      console.log('Successfully enrolled admin user "admin"');
      return fabric_client.createUser(
        {
          username: 'admin',
          mspid: 'org1',
          cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
        });
    }).then((user) => {
      admin_user = user;
      return fabric_client.setUserContext(admin_user);
    }).catch((err) => {
      console.error('Failed to enroll and persist admin. Error: ' + err.stack ? err.stack : err);
      throw new Error('Failed to enroll admin');
    });
  }
}).then(() => {
  console.log('Assigned the admin user to the fabric client ::' + admin_user.toString());
}).catch((err) => {
  console.error('Failed to enroll admin: ' + err);
});
