echo "creating data files"
while read -r line
    cat line | jq -r '.assets[]'-o $NFTIMAGE

do "$CACHE/dataList.txt"
