#!/bin/bash

ADDR="addrList.txt"
FULLNFT="nftfile.txt"
NFTIMAGE="images.txt"
FILELIST="archiveList.txt"

## get the list of addresses to check from the addrList
echo "Found these Addresses:"
while IFS= read -r line
do
  printf "address: %s \n" "$line"
done < "$ADDR"

## for each address get the payloads and save them to a file
## step 1: cleanup the old files
./cleanup.sh $FILELIST

## step 2: create a file with the json payload for each nft for the addresses
while IFS= read -r line
do
  curl  --request GET  --url 'https://api.opensea.io/api/v1/assets?owner='$line'&order_direction=desc&offset=0&limit=20' | jq -r >> $FULLNFT
done < "$ADDR"

## step 3: get each image

echo "saving images"

cat $FULLNFT | jq -r '.assets[].image_url' -o $NFTIMAGE
cat $NFTIMAGE
while read -r line
  printf "getting %s /n" "$line"
do < "$NFTIMAGE"
