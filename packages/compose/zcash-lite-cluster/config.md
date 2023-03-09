This docker file spins up a zcash node running with prune

Recommended environmental variables: 

{
  "ZCASHD_DBCACHE_SIZE": "1024",
  "ZCASHD_IMAGE": "electriccoinco/zcashd:latest",
  "ZCASHD_MEM_LIM": "4G",
  "ZCASHD_NETWORK": "mainnet",
  "ZCASHD_PRUNE_SIZE": "1024",
  "": ""
}

This keeps the node pruned to 1 GB and sets the db sync size to 1GB as well for fast sync. 

ZCASHD_MEM_LIM sets the max size of the continer.

The ZCASHD_PRIME_NODE is a node that can be used to seed the nodes. 
```
$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <zcashd-container-name>)"<p2p-port-on-zcashd>"
```

Example: 
```
export ZCASHD_PRIME_NODE=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' zcash_zcashd_1)":8233"
```