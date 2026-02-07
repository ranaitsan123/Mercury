#!/bin/sh

OUTPUT="project_dump_backend.txt"

echo "==============================" > $OUTPUT
echo "PROJECT COMMAND DUMP" >> $OUTPUT
echo "==============================" >> $OUTPUT
echo "" >> $OUTPUT

echo "$ ls -a" >> $OUTPUT
ls -a >> $OUTPUT
echo "" >> $OUTPUT

echo "$ cat .env docker-compose.yml" >> $OUTPUT
cat .env docker-compose.yml >> $OUTPUT
echo "" >> $OUTPUT

echo "$ cd backend" >> $OUTPUT
cd backend || exit 1

echo "$ ls" >> ../$OUTPUT
ls >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ cat Dockerfile" >> ../$OUTPUT
cat Dockerfile >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ cat requirements.txt" >> ../$OUTPUT
cat requirements.txt >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ cat entrypoint.sh" >> ../$OUTPUT
cat entrypoint.sh >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ cat manage.py" >> ../$OUTPUT
cat manage.py >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ ls emails" >> ../$OUTPUT
ls emails >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ cat emails/*.py" >> ../$OUTPUT
cat emails/*.py >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ ls users" >> ../$OUTPUT
ls users >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ cat users/*" >> ../$OUTPUT
cat users/* >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ ls scanner" >> ../$OUTPUT
ls scanner >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ cat scanner/*.py" >> ../$OUTPUT
cat scanner/*.py >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ ls middleware" >> ../$OUTPUT
ls middleware >> ../$OUTPUT
echo "" >> ../$OUTPUT 

echo "$ cat middleware/*" >> ../$OUTPUT
cat middleware/* >> ../$OUTPUT
echo "" >> ../$OUTPUT 

echo "$ ls tests" >> ../$OUTPUT
ls tests >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ cat tests/*" >> ../$OUTPUT
cat tests/* >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ ls realtime" >> ../$OUTPUT
ls realtime >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ cat realtime/*" >> ../$OUTPUT
cat realtime/* >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ ls backend" >> ../$OUTPUT
ls backend >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ cat backend/*.py" >> ../$OUTPUT
cat backend/*.py >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ ls backend/common" >> ../$OUTPUT
ls backend/common >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ cat backend/common/*" >> ../$OUTPUT
cat backend/common/* >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "==============================" >> ../$OUTPUT
echo "END OF DUMP" >> ../$OUTPUT
