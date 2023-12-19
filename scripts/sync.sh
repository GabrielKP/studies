#!/bin/sh
# Author: Gabriel Kressin

if [[ $1 ]]
then
    WHOST=$1;
else
    if [[ $LV_HOST ]];
    then
        WHOST=$LV_HOST;
    else
        echo "LV_HOST not set, require as first argument or set in shell";
        exit 1
    fi
fi

rsync -rv\
    --delete\
    www/ $WHOST:~/psyserver/data/studies/study-fa

