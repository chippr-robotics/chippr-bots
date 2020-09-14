![HD Logo](./hdlogo.png)


# Helm's Deep 

## An unstable testing network

This network is intended for deployment and testing of experimental code and clients. Open endpoints are for development and transparency only


## Work Flow
``` 
                  Docker hub                - HD_MINER_1
                   /\                       - HD_MINER_2
                   ||                       - HD_NODE_3
Code => Github => Jenkins => docker-compose - HD_NODE_4       => elk
                   /\                       - HD_NODE_5
                   ||                       - HD_NODE_6
                  Vault
```
                  
                  
## Test plans

### Crash testing

Node images  | Fork block | Status   | Date 
------------ | ---------- | -------  | ------
Chippr-Geth(x6n)  |          0       |  []     | 9/1/2020 
Chippr-Geth(x6n)  |       30,001     |  | tbd
Chippr-Geth(x6n)  |    2,000,000       |  []     | tbd
Chippr-Geth(x2m2n) Core-Geth(x3n) | 2,000,000 | [] | tbd
Chippr-Geth(x1m2n) Core-Geth(x1m2n) | 2,000,000 | [] | tbd

### Integration testing

Node images  | Fork block | Status   | Date 
------------ | ---------- | -------  | ------
Chippr-Geth(x1m2n) Core-Geth(x1m2n) | 2,000,000 | [] | tbd
Chippr-Geth(x2m2n) Core-Geth(x1n) Besu(x1n) | 2,000,000 | [] | tbd
Chippr-Geth(x2m1n) Core-Geth(x1n) Besu(x1n) Mantis(x1n) | 2,000,000 | [] | tbd

## Folder structure
```
/. 
 |
 \- theBurg - files for deploying helmsdeep
 |    |
 |    \- helmsdeep - helm chart
 |    |
 |    - helmsdeep.tf - terraform script for gcp kube cluster
 |
 - docker-compose.yml - dockercompose for local testing with 6 nodes
 |
 - hdlogo.png - a logo image for this readme
 |
 - helmsdeep.json - genesis file for helmsdeep network