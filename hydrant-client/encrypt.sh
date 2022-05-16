tar -cvf data.tar public/models
#brotli data.tar
gzip -9 data.tar
echo $KEYS | gpg --batch --passphrase-fd 0 --symmetric --output data.tar.gz.gpg data.tar.gz