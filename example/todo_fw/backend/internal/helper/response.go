package helper

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func ReadFromRequestBody(request *http.Request, result any) error {
	decoder := json.NewDecoder(request.Body)
	err := decoder.Decode(result)
	if err != nil {
		return fmt.Errorf("read from request body:\n%v", err)
	}

	return nil
}

func WriteToResponseBody(writer http.ResponseWriter, response any) error {
	writer.Header().Add("Content-Type", "application/json")
	encoder := json.NewEncoder(writer)
	err := encoder.Encode(response)
	if err != nil {
		return fmt.Errorf("write to response body: %w", err)
	}
	return nil
}
