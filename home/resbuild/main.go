package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path"
	"strings"
	"text/template"
	"time"
)

const (
	Professional = iota
	Casual
	Blunt
)

type letterData struct {
	SelectedTemplate string
	CompanyName      string
	PositionName     string
	Location         string
	CurrentTime      string
	MechJob          bool
	Skills           []bool `json:"skill_flags"`
}

func main() {
	// newLetter := letterData{
	// 	CompanyName:  "Boeing",
	// 	PositionName: "Best Boy",
	// 	Location:     "Brisbane",
	// }

	// makeLatex(newLetter, "no_relation_letter")

	http.Handle("/", http.FileServer(http.Dir("./web")))
	http.HandleFunc("/form", formHandler)
	fmt.Printf("Go to http://127.0.0.1:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))

}

func formHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var ld letterData

		err := json.NewDecoder(r.Body).Decode(&ld)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		fmt.Printf("Received form data: %+v\n", ld)
		ld.CurrentTime = time.Now().Format(time.RFC3339)
		// Process the form data here
		template2use := "skill_issue" //default
		fmt.Println(ld.SelectedTemplate)
		switch ld.SelectedTemplate {
		case "Professional":
			template2use = "professional_letter"
		case "Desperate_Not_Me":
			template2use = "desperate_not_me"
		case "Casual":
			template2use = "no_relation_letter"
		case "Blunt":
			template2use = "blunt_letter"
		case "Skill_Issue":
			template2use = "skill_issue"
		}

		pdfPath, err := makeLatex(ld, template2use)

		if err != nil {
			// w.Write([]byte("Error creating form" + err.Error()))
			http.Error(w, "Error generating PDF: "+err.Error(), http.StatusInternalServerError)
		} else {
			w.Header().Set("Content-Disposition", "attachment; filename="+pdfPath)
			w.Header().Set("Content-Type", "application/pdf")
			http.ServeFile(w, r, pdfPath)
		}

	} else {

		http.ServeFile(w, r, "index.html")
	}

}

// returns the filepath of the generated file, or an error
func makeLatex(ld letterData, input string) (string, error) {
	ld_sanitised := ld
	ld_sanitised.CompanyName = string4Latex(ld.CompanyName)

	tmplFilePath := path.Join("templates", "letters", fmt.Sprintf("%s.tex", input))
	tmplFile, err := os.Open(tmplFilePath)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return "", err
	}
	defer tmplFile.Close()

	outputFileName := fmt.Sprintf("%s_%s_letter.tex", ld.CompanyName, ld.PositionName)
	outputFilePath := path.Join("output", "letters", outputFileName)
	outputFile, err := os.Create(outputFilePath)
	if err != nil {

		return "", errors.New(fmt.Sprint("error opening file:", err))
	}
	defer outputFile.Close()

	// tmpl.Delims("==<", ">==")
	funcMap := template.FuncMap{
		"getFlagAt": getFlagAt,
	}

	// tmpl, err := template.ParseFiles(string(tmplFilePath))
	// have to read template into program
	tmplContent, err := os.ReadFile(tmplFilePath)
	if err != nil {
		return "", errors.New(fmt.Sprint("error Reading Template: ", err))
	}

	tmpl, err := template.New("template").Funcs(funcMap).Parse(string(tmplContent))
	if err != nil {
		fmt.Println("Error Parsing Template", err)
		return "", errors.New(fmt.Sprint("error Parsing Template: ", err))
	}

	err = tmpl.Execute(outputFile, ld_sanitised)
	if err != nil {
		fmt.Println("Error Executing Template:", err)
		return "", errors.New(fmt.Sprint("error Executing Template: ", err))
	}

	cmd := exec.Command("pdflatex", outputFilePath, fmt.Sprintf("-output-directory=%s", path.Join("output", "letters")))
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Println("Error Calling pdflatex:", err)
		return "", errors.New(fmt.Sprint("error Calling pdflatex: ", err))
	}

	fmt.Println(string(output))
	pdfFileName := fmt.Sprintf("%s_%s_letter.pdf", ld.CompanyName, ld.PositionName)
	pdfFilePath := path.Join("output", "letters", pdfFileName)
	return pdfFilePath, nil
}

func string4Latex(input string) string {
	return strings.Replace(input, "&", "\\&", -1)
}

func getFlagAt(flags []bool, index int) bool {
	if index < len(flags) {
		return flags[index]
	}
	return false
}
