import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import {LocalReport} from "./modules/connection.js";
import { simulator_controller } from "./modules/simulator.js";

class Ex6_6 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper("Exercise 6.6: Custom Search on a Linked List");
	
	  let report = new LocalReport();
    this.connections.push(report);
    let linked_list = this.generate_linked_list_nodes();
    let data_blob;
    this.ui.add_test(
      "Compilation",
      async _ => {
        report.restart();
        data_blob = this.add_random_data(linked_list[0]);
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
        "6\n",
        "0\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );
    this.ui.add_test(
      "Test 2 (question)",
      this.simple_equality_test(
        "45\n",
        "-1\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );
    this.ui.add_test(
      "Test 3 (question)",
      this.simple_equality_test(
        "-64\n",
        "2\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );

    for (let i = 4; i <= 10; i++) {
      let random_test = this.generate_test(linked_list[1]);
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
      
      // window.parent.postMessage({comment: this.ui.test_results, grade: grade, finish_test: true});
      let blob = report.generate_report();
      return `Grade: ${grade}. Download your test report from Assistant execution <a href=${window.URL.createObjectURL(blob)} download="ex6_6.report">(click here)</a>.\nYou can also download the data file that was linked to your program <a href=${window.URL.createObjectURL(data_blob)} download="data.s">(here)</a>.`
    }
  }

  shuffle(array){ 
    for (let i = array.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [array[i], array[j]] = [array[j], array[i]]; 
    } 
    return array; 
  };

  generate_linked_list_nodes(){
    let total_nodes = this.randint(100, 200);
    let node_array = [
      "head_node:\n.word 10\n.word -4\n.word node_1\n",
      "node_1:\n.word 56\n.word 78\n.word node_2\n",
      "node_2:\n.word -654\n.word 590\n.word node_3\n",
      "node_3:\n.word -100\n.word -43\n.word node_4\n",
    ];
    let sum_value, left_value;
    let existing_values = [6, 134, -64, -143];
    for (let i = 4; i < total_nodes; i++){
      do {
        sum_value = this.randint(-10000, 10000);
      } while (existing_values.includes(sum_value) || sum_value == 45);  // 45 is a question example
      existing_values.push(sum_value);
      left_value = this.randint(-10000, 10000);
      let next_node = i < total_nodes - 1 ? `node_${i+1}` : "0";
      node_array.push(`node_${i}:\n.word ${left_value}\n.word ${sum_value - left_value}\n.word ${next_node}\n`);
    }
    node_array = this.shuffle(node_array);
    return [node_array, existing_values];
  }

  add_random_data(node_array){
    const code = ".globl head_node\n.data\n" + node_array.join("");
    let data = new TextEncoder("utf-8").encode(code);
    let blob = new Blob([data], {type: "application/octet-stream"});
    let file = new File([blob], "data.s");
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

new Ex6_6();