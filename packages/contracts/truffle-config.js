module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!''
  networks: {
    kotti:{
      host: "172.16.0.144",
      port: 8554,
      network_id: "6", // match any network
      from: "0x5b53e0b34743ae54a7e8fc76a4f60d915499b8b2" //dev account
    }
  },
  compilers: {
    solc: {
      version: "0.4.20"
    }
  }
};
