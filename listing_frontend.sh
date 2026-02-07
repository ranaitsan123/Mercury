#!/bin/sh

OUTPUT="project_dump_frontend.txt"

echo "==============================" > $OUTPUT
echo "PROJECT COMMAND DUMP" >> $OUTPUT
echo "==============================" >> $OUTPUT
echo "" >> $OUTPUT


echo "$ cd frontend" >> $OUTPUT
cd frontend || exit 1

echo "$ ls" >> ../$OUTPUT
ls >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ ls src" >> ../$OUTPUT
ls src >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ ls src/components" >> ../$OUTPUT
ls src/components >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ ls src/lib" >> ../$OUTPUT
ls src/lib >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ cat src/lib/*" >> ../$OUTPUT
cat src/lib/* >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ ls src/services" >> ../$OUTPUT
ls src/services >> ../$OUTPUT   
echo "" >> ../$OUTPUT

echo "$ cat src/services/*" >> ../$OUTPUT
cat src/services/* >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ ls src/graphql" >> ../$OUTPUT
ls src/graphql >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "$ cat src/graphql/*" >> ../$OUTPUT
cat src/graphql/* >> ../$OUTPUT
echo "" >> ../$OUTPUT

echo "==============================" >> ../$OUTPUT
echo "END OF DUMP" >> ../$OUTPUT
