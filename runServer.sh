#!/bin/bash

db=$1

node loadData.js $db

node express.js $db
