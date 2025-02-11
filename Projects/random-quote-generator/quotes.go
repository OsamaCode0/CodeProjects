package main

import (
	"encoding/json" // For JSON parsing
	"fmt"
	"io/ioutil" // To read the contents of the file
	"math/rand" // For random number generation
	"os"        // To open and work with files
	"time"      // To seed the random generator (optional)
)


func parseJson(filePath string) ([]string, error) {

		jsFile, err := os.Open(filePath)
		if err != nil {
			fmt.Println("Error accured when opening file", err)
		}
		defer jsFile.Close()

		fileContent, err := ioutil.ReadAll(jsFile)
		if err != nil {
			fmt.Println("Error while reading", err)
		}
		
		var quotes []string

		err = json.Unmarshal(fileContent, &quotes)
		if err != nil {
			fmt.Println("Error while parsing")
		}

		return quotes, nil
}


func main () {

	Quotes, err := parseJson("quotes.json")
	if err != nil {
		fmt.Println("Error while opening file", err)
		return
	}


	rand.Seed(time.Now().Unix())
	randomQuote := Quotes[rand.Intn(len(Quotes))]
	fmt.Println(randomQuote)
}


