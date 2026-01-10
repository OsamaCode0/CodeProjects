package exception

import (
	"fmt"
	"net/http"
	"strings"
	"todo/internal/helper"
	"todo/internal/types"
)

func HandleResponseError(writer http.ResponseWriter, err error) {

	switch {
	case strings.Contains(err.Error(), "does not exist"): // does not exist
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusNotFound)
		helper.WriteToResponseBody(writer, types.WebResponse{
			Code:   http.StatusNotFound,
			Status: "StatusNotFound",
			Data:   fmt.Sprintf("status not found:\n%v", err),
		})
		return
	case strings.Contains(err.Error(), "forbidden"):
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusForbidden)
		helper.WriteToResponseBody(writer, types.WebResponse{
			Code:   http.StatusForbidden,
			Status: "FORBIDDEN",
			Data:   fmt.Sprintf("unauthorized:\n%v", err),
		})
		return
	case strings.Contains(err.Error(), "NULL"):
		writer.WriteHeader(http.StatusNotFound)
		helper.WriteToResponseBody(writer, types.WebResponse{
			Code:   http.StatusNotFound,
			Status: "NotFound",
			Data:   fmt.Sprintf("status not found:\n%v", err),
		})
		return
	default:
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusInternalServerError)
		helper.WriteToResponseBody(writer, types.WebResponse{
			Code:   http.StatusInternalServerError,
			Status: "Internal Server Error",
			Data:   fmt.Sprintf("internal server error:\n%v", err),
		})
		return
	}

}

func HandleBadRequestError(writer http.ResponseWriter, err error) {

	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(http.StatusBadRequest)
	helper.WriteToResponseBody(writer, types.WebResponse{
		Code:   http.StatusBadRequest,
		Status: "StatusBadRequest",
		Data:   fmt.Sprintf("error:\n%v", err),
	})

}

func HandleUnauthorized(writer http.ResponseWriter, err error) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(http.StatusUnauthorized)
	helper.WriteToResponseBody(writer, types.WebResponse{
		Code:   http.StatusUnauthorized,
		Status: "StatusUnauthorized",
		Data:   fmt.Sprintf("unauthorized:\n%v", err),
	})
}
