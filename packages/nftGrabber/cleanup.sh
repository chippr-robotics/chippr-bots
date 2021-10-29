## receives a filelist to archive as $1
echo "####### \n"
echo "Cleaning up files \n"
echo "####### \n"

## step 1: save the old with a time stamp
current_time=$(date "+%Y.%m.%d-%H.%M.%S")

while read -r file
do
  tar -czvf archive/$file.$current_time.tar.gz $file
  echo "Archiving and removing file: " & rm $file
done < $1

