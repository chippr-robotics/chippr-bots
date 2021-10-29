#!/bin/bash

ARCH="archive"
DATA="data"
IMG="image"
CACHE="cache"
ADDR="addrList.txt"
FULLNFT="nftfile.txt"
FILELIST="archive/archiveList.txt"

## ANNOUNCE MODULES 
echo
echo "running filesystem check..."

## check for address list file
test "$ADDR" && echo "$ADDR exists." || echo "creating blank address list. This needs to be populated with public keys prior to proceding" | touch $ADDR

## look for the directories that will be used, create them if they are missing
test -d "$ARCH" && echo "$ARCH exists." || echo "creating blank archive directory." | mkdir -p $ARCH
test -d "$DATA" && echo "$DATA exists." || echo "creating blank data directory." | mkdir -p $DATA
test -d "$IMG" && echo "$IMG exists." || echo "creating blank image directory." |  mkdir -p $IMG 
test -d "$CACHE" && echo "$CACHE exists." || echo "creating blank image directory." |  mkdir -p $CACHE

## define and/or create the right working files

#FULL NFT DATA BLOB
test -f "$FULLNFT" && echo "$FULLNFT exists." || echo "creating blank nft file." | touch $FULLNFT

#ARCHIVE FILE LIST
test -f "$FILELIST" && echo "$FILELIST exists." || echo "creating blank nft file." | touch $FILELIST

echo "filesystem check complete!"
echo