// Import assistant and logging modules
import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import {LocalReport} from "./modules/connection.js";

class Ex2_2 extends Assistant_Script {

  constructor(){
    super();
    this.ui = new UI_Helper("Exercise 2.2: Simple Symbol Calculator");
    let report = new LocalReport();
    this.connections.push(report);

    // Enable syscalls and set the program stack
    this.predefined_args = ["--newlib", "--setreg", "sp=0x7FFFFFC", "--isa", "acdfimsu"];

    this.ui.add_test("Compilation", _ => {report.restart(); return this.generic_compile_test()();}, {fail_early: true});

    // Add fixed tests
    let test_id = 1
    this.ui.add_test(`Test ${test_id++} (question) - Add`, this.simple_equality_test(`2 + 3\n`, `5\n`, {compare_function: (a,b) => a.trim() == b.trim()}))
    this.ui.add_test(`Test ${test_id++} (question) - Sub`, this.simple_equality_test(`7 - 7\n`, `0\n`, {compare_function: (a,b) => a.trim() == b.trim()}))
    this.ui.add_test(`Test ${test_id++} (question) - Mul`, this.simple_equality_test(`4 * 2\n`, `8\n`, {compare_function: (a,b) => a.trim() == b.trim()}))

    for (let i = 0; i < 3; i++) {
      let a = this.randint(0,9);
      let b = this.randint(0,9-a);  
      this.ui.add_test(`Test ${test_id++} - Add`, this.simple_equality_test(`${a} + ${b}\n`, `${a+b}\n`, {compare_function: (a,b) => a.trim() == b.trim()}))
      a = this.randint(0,9);
      b = this.randint(0,a);
      this.ui.add_test(`Test ${test_id++} - Sub`, this.simple_equality_test(`${a} - ${b}\n`, `${a-b}\n`, {compare_function: (a,b) => a.trim() == b.trim()}))
      a = this.randint(0,3);
      b = this.randint(0,3);
      this.ui.add_test(`Test ${test_id++} - Mul`, this.simple_equality_test(`${a} * ${b}\n`, `${a*b}\n`, {compare_function: (a,b) => a.trim() == b.trim()}))
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
      // window.parent.postMessage({comment: this.ui.test_results, grade: grade, finish_test: true})
      let blob = report.generate_report();
      return `Grade: ${grade}. Download your test report from Assistant execution report <a href=${window.URL.createObjectURL(blob)} download="ex2_2.report">(click here)</a>.`
    }

  }

  randint(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

}

new Ex2_2();
