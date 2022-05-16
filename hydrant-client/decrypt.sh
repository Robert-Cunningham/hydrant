#apt update && apt install brotli gnupg
echo $KEYS | gpg --batch --passphrase-fd 0 data.tar.gz.gpg
gunzip data.tar.gz
#brotli --decompress data.tar.br
tar -xvf data.tar