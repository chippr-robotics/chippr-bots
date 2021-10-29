echo
echo "Found these Addresses:"

while IFS= read -r line
do
  printf "address: %s \n" "$line"
done < "$1"

echo "Address list complete"