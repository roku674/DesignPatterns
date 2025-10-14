#!/bin/bash

BASE="/home/roku674/Alex/DesignPatterns/Java/Microservices"
ERRORS=0
SUCCESS=0

echo "Testing compilation of all 53 Microservices patterns..."
echo "=========================================================="

for dir in "$BASE"/*/ ; do
    pattern=$(basename "$dir")
    
    if [ -f "$dir/Main.java" ]; then
        echo -n "Testing $pattern... "
        
        TMP_DIR="/tmp/compile_test_${pattern}"
        mkdir -p "$TMP_DIR"
        
        if cd "$dir" && javac -d "$TMP_DIR" *.java 2>/dev/null; then
            echo "✓ OK"
            SUCCESS=$((SUCCESS + 1))
        else
            echo "✗ FAILED"
            ERRORS=$((ERRORS + 1))
        fi
        
        rm -rf "$TMP_DIR"
    fi
done

echo ""
echo "=========================================================="
echo "Results: $SUCCESS passed, $ERRORS failed"
echo "Total patterns: $((SUCCESS + ERRORS))"

if [ $ERRORS -eq 0 ]; then
    echo "✓ All patterns compile successfully!"
    exit 0
else
    echo "✗ Some patterns failed to compile"
    exit 1
fi
