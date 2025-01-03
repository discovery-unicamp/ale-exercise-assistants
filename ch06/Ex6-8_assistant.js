import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import {LocalReport} from "./modules/connection.js";
import { simulator_controller } from "./modules/simulator.js";

class Ex6_8 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper("Exercise 6.8: ABI-compliant Recursive Binary Tree Search");
	
	  let report = new LocalReport();
    this.connections.push(report);
    let binary_tree = this.generate_binary_tree();
    let code_blob, lib_blob;
    this.ui.add_test(
      "Compilation",
      async _ => {
        report.restart();
        code_blob = this.add_random_data(binary_tree[0]);
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
      "Test 1 (question)",
      this.simple_equality_test(
        "12\n",
        "1\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );
    this.ui.add_test(
      "Test 2 (question)",
      this.simple_equality_test(
        "562\n",
        "3\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );
    this.ui.add_test(
      "Test 3 (question)",
      this.simple_equality_test(
        "-40\n",
        `0\n`,
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );


    for (let i = 4; i <= 10; i++) {
      let random_test = this.generate_test(binary_tree[0], binary_tree[1]);
      this.ui.add_test(
        `Test ${i}`,
        this.simple_equality_test(
          random_test[0],
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
      return `Grade: ${grade}. Download your test report from Assistant execution <a href=${window.URL.createObjectURL(blob)} download="ex6_8.report">(click here)</a>.\nYou can also download the testing code that was linked to your program <a href=${window.URL.createObjectURL(code_blob)} download="testing.c">(here)</a>.`
    }
  }



  generate_binary_tree(){
    let total_nodes = this.randint(100, 200);
    let existing_values = [12, 5, -78, -43, 361, 562, 9, -798];
    let value;
    let tree = {};
    // Question fixed structure
    tree["root_node"] = {"depth": 1, "val": 12, "left": "&node_1", "right": "&node_2"};
    tree["node_1"] = {"depth": 2, "val": 5, "left": "&node_3", "right": "&node_4"};
    tree["node_2"] = {"depth": 2, "val": -78, "left": "NULL", "right": "&node_5"};
    tree["node_3"] = {"depth": 3, "val": -43, "left": "NULL", "right": "NULL"};
    tree["node_4"] = {"depth": 3, "val": 361, "left": "NULL", "right": "NULL"};
    tree["node_5"] = {"depth": 3, "val": 562, "left": "&node_6", "right": "&node_7"};
    tree["node_6"] = {"depth": 4, "val": 9, "left": "NULL", "right": "NULL"};
    tree["node_7"] = {"depth": 4, "val": -798, "left": "NULL", "right": "NULL"};
    let placement, p_aux, index;
    let availabe_leaves = [
      "node_2-left",
      "node_3-left",
      "node_3-right",
      "node_4-left",
      "node_4-right",
      "node_6-left",
      "node_6-right",
      "node_7-left",
      "node_7-right"
    ];

    for (let i = 8; i < total_nodes; i++){
      do {
        value = this.randint(-10000, 10000);
      } while (existing_values.includes(value) || (value == -40)); // -40 is a question example
      index = this.randint(0, availabe_leaves.length-1);
      placement = availabe_leaves[index];
      availabe_leaves.splice(index, 1);
      p_aux = placement.split("-");
      tree[`node_${i}`] = {
        "depth": tree[p_aux[0]]["depth"] + 1,
        "val": value,
        "left": "NULL",
        "right": "NULL"
      };
      tree[p_aux[0]][p_aux[1]] = `&node_${i}`;
      availabe_leaves.push(`node_${i}-left`);
      availabe_leaves.push(`node_${i}-right`);
      existing_values.push(value);
    }
    return [tree, existing_values];
  }

  add_random_data(tree){
    let nodes_init = [];
    for (const node in tree) {
      nodes_init.push(`${node}.val = ${tree[node].val};${node}.left = ${tree[node].left};${node}.right = ${tree[node].right};`);      
    };

    const code = `
    #include "lib.h"

    char buffer[100];

    #define NULL 0

    void _start(){
      int val;
      Node ${Object.keys(tree).join(",")};
      ${nodes_init.join('\n        ')}
      val = atoi(gets(buffer));
      puts(itoa(recursive_tree_search(&root_node, val), buffer, 10));
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
      int val;
      struct Node *left, *right;
    } Node;
    
    int recursive_tree_search(Node *root_node, int val);
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

  generate_test(tree, existing_values) {
    let found = this.randint(0, 3);
    let val, depth;
    if (found == 0){
      depth = 0;
      do {
        val = this.randint(-10000, 10000);
      } while (existing_values.includes(val));
    } else {
      let index = this.randint(1, Object.keys(tree).length - 1);
      val = tree[`node_${index}`].val;
      depth = tree[`node_${index}`].depth;
    }
    let input = `${val}\n`;
    let output = `${depth}\n`;
    return [input, output];
  }
}

new Ex6_8();
