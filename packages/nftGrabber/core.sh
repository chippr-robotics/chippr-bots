#!/bin/bash

##set all the variables and create needd files
time . src/step0.sh

## get the list of addresses to check from the addrList
time src/getAddr.sh $ADDR

## for each address get the payloads and save them to a file
## step 1: cleanup the old files
time src/cleanup.sh $FILELIST

## step 2: create a file with the json payload for each nft for the addresses
time src/getList.sh $ADDR

## step 3: make the nft data files
time src/dataMaker.sh $FULLNFT

## step 4: fetch the images and save them
time src/imgFetcher.sh

## step 5: create the archive file list

