import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import {LocalReport} from "./modules/connection.js";
import { simulator_controller } from "./modules/simulator.js";

class Ex6_7 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper("Exercise 6.7: ABI-compliant Linked List Custom Search");
	
	  let report = new LocalReport();
    this.connections.push(report);
    let linked_list = this.generate_linked_list_nodes();
    let code_blob, lib_blob;
    let number = this.randint(1000,5000);
    this.ui.add_test(
      "Compilation",
      async _ => {
        report.restart();
        code_blob = this.add_random_data(linked_list[0], linked_list[1], number);
        lib_blob = this.add_lib();
        this.default_filename = await this.compile_code();
        this.ui.log(this.stdoutBuffer); 
        this.ui.log(this.stderrBuffer); 
        this.log_output();
        this.log_input_files();
        if(this.default_filename) return true;
        return false;
        }, {fail_early: true}
      );
    
    this.ui.add_test(
      "Test 1 - Case 0",
      this.simple_equality_test(
        "0\n",
        "0\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );

    let case_1 = this.randint(0, 2);
    let possible_cases_1 = ["Answer\n", "Answer with spaces\n", "answer\n"]
    this.ui.add_test(
      "Test 2 - Case 1",
      this.simple_equality_test(
        `1\n${possible_cases_1[case_1]}`,
        possible_cases_1[case_1],
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );
    this.ui.add_test(
      "Test 3 - Case 2",
      this.simple_equality_test(
        "2\n",
        `${number}\n`,
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );

    this.ui.add_test(
      "Test 4 - Case 3",
      this.simple_equality_test(
        `3\n${number}\n`,
        `${this.hex_code(number)}\n`,
        { compare_function: (a,b) => a.trim().toUpperCase() == b.trim().toUpperCase() }
      )
    );
    
    let case_4 = this.randint(0, 2);
    let possible_cases_4 = ["Double\nLines\n", "Double\nLines with spaces\n", "double\nlines\n"]
    this.ui.add_test(
      "Test 5 - Case 4",
      this.simple_equality_test(
        `4\n${possible_cases_4[case_4]}`,
        possible_cases_4[case_4],
        { compare_function: (a,b) => this.custom_compare(a, b) }
      )
    );

    this.ui.add_test(
      "Test 6 - Case 5",
      this.simple_equality_test(
        "5\n6\n",
        "0\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );

    this.ui.add_test(
      "Test 7 - Case 5",
      this.simple_equality_test(
        "5\n45\n",
        "-1\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );

    for (let i = 8; i <= 10; i++) {
      let random_test = this.generate_test(linked_list[2]);
      this.ui.add_test(
        `Test ${i} - Case 5`,
        this.simple_equality_test(
          `5\n${random_test[0]}`,
          random_test[1],
          {compare_function: (a,b) => a.trim() == b.trim()}
          )
        );
    }
  
    this.ui.final_result = _ => {
      report.report["test_results"] = this.ui.test_results;
      let grade = 0;
      if (this.ui.test_results[0] != 0) {
        let n_tests = this.ui.test_results.length
        for (let i = 1; i < n_tests; i++) {
          grade += this.ui.test_results[i];
        }
        grade = (grade * 10) / (n_tests-1);
      }
      report.report["final_grade"] = grade;

      window.parent.postMessage({comment: this.ui.test_results, grade: grade, finish_test: true});
      let blob = report.generate_report();
      return `Grade: ${grade}. Download your test report from Assistant execution <a href=${window.URL.createObjectURL(blob)} download="ex6_7.report">(click here)</a>.\nYou can also download the testing code that was linked to your program <a href=${window.URL.createObjectURL(code_blob)} download="testing.c">(here)</a>.`
    }
  }

  custom_compare(a, b){
    let expected = a.split('\n').filter((item => item != ""));
    let result = b.split('\n').filter((item => item != ""));
    return expected.join('\n') == result.join('\n');
  };

  shuffle(array){ 
    for (let i = array.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [array[i], array[j]] = [array[j], array[i]]; 
    } 
    return array; 
  };

  hex_code(val){
    let uval = val>>>0;
    let hex = "";

    for (let i = 0; i < 8; i++){
      let aux = uval % 16;
      if (aux >= 10)
        hex = String.fromCharCode(aux - 10 + 'A'.charCodeAt(0)) + hex;
      else
        hex = String.fromCharCode(aux + '0'.charCodeAt(0)) + hex;
      uval = (uval - aux) / 16;
      console.log(uval);
      if (uval == 0){
        break;
      } 
    }
    return hex;
  }

  generate_linked_list_nodes(){
    let total_nodes = this.randint(100, 200);
    let val1 = [10, 56, -654, -100];
    let val2 = [-4, 78, 590, -43]
    let sum_value, left_value;
    let existing_values = [6, 134, -64, -143];
    for (let i = 4; i < total_nodes; i++){
      do {
        sum_value = this.randint(-10000, 10000);
      } while (existing_values.includes(sum_value) || sum_value == 45); // 45 is a question example
      existing_values.push(sum_value);
      left_value = this.randint(-10000, 10000);
      val1.push(left_value);
      val2.push(sum_value - left_value);
    }
    return [val1, val2, existing_values];
  }

  add_random_data(val1, val2, number){
    let num_nodes = val1.length;
    let nodes = ["head_node"]
    for (let i = 1; i < num_nodes; i++){
      nodes.push(`node_${i}`)
    }
    let nodes_init = [];
    for (let i = 0; i < num_nodes; i++){
      if (i < num_nodes - 1){
        nodes_init.push(`${nodes[i]}.val1 = ${val1[i]};${nodes[i]}.val2 = ${val2[i]};${nodes[i]}.next = &${nodes[i+1]};`);
      } else {
        nodes_init.push(`${nodes[i]}.val1 = ${val1[i]};${nodes[i]}.val2 = ${val2[i]};${nodes[i]}.next = NULL;`);
      }
    }
    const code = `
    #include "lib.h"

    char buffer[100];
    int number = ${number};

    #define NULL 0

    void run_operation(int op){
        int val;
        Node ${this.shuffle(nodes).join(",")};
        ${nodes_init.join('\n        ')}
        
        switch (op){
            case 0:
                puts(buffer);
                break;

            case 1:
                gets(buffer);
                puts(buffer);
                break;

            case 2:
                puts(itoa(number, buffer, 10));
                break;

            case 3:
                puts(itoa(atoi(gets(buffer)), buffer, 16));
                break;

            case 4:
                gets(buffer);
                puts(buffer);
                gets(buffer);
                puts(buffer);
                break;

            case 5:
                val = atoi(gets(buffer));
                puts(itoa(linked_list_search(&head_node, val), buffer, 10));
                break;
            
            default:
                break;
            }
    }

    void _start(){
        int operation = atoi(gets(buffer));
        run_operation(operation);
        exit(0);
    }
    `
    let data = new TextEncoder("utf-8").encode(code);
    let blob = new Blob([data], {type: "application/octet-stream"});
    let file = new File([blob], "testing.c");
    simulator_controller.load_new_file(file);
    return blob;
  }

  add_lib(){
    const code = `
    typedef struct Node {
      int val1, val2;
      struct Node *next;
    } Node;
    
    int linked_list_search(Node *head_node, int val);
    void puts ( const char *str );
    char *gets ( char *str );
    int atoi (const char *str);
    char *itoa ( int value, char *str, int base );
    void exit(int code);
    `
    
    let data = new TextEncoder("utf-8").encode(code);
    let blob = new Blob([data], {type: "application/octet-stream"});
    let file = new File([blob], "lib.h");
    simulator_controller.load_new_file(file);
    return blob;
  }

  randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generate_test(existing_values) {
    let found = this.randint(0, 3);
    let val, index;
    if (found == 0){
      index = -1;
      do {
        val = this.randint(-10000, 10000);
      } while (existing_values.includes(val));
    } else {
      index =  this.randint(0, existing_values.length);
      val = existing_values[index];
    }
    let input = `${val}\n`;
    let output = `${index}\n`;
    return [input, output];
  }
}

new Ex6_7();