// Example of assistant script
import { UI_Helper, Assistant_Script } from "./modules/assistant.js";
import { LocalReport } from "./modules/connection.js";

class Ex3_1 extends Assistant_Script {
  constructor() {
    super();
    this.ui = new UI_Helper("Exercise 3.1: Number Base Conversion in C");
    let report = new LocalReport();
    this.connections.push(report);
    // Enable syscalls and set the program stack
    this.predefined_args = ["--newlib", "--setreg", "sp=0x7FFFFFC", "--isa", "acdfimsu"];


    function numeric_comparison(x, y) {
      let sx = x.trim().split(/\r?\n/).filter(element => element);
      let sy = y.trim().split(/\r?\n/).filter(element => element);

      if (sx.length != 4) {
        return false;
      }

      let g = 0.0;

      let r = [
        /^0b[0-1]+$/,
        /^-?[0-9]+$/,
        /^0x[0-9a-fA-F]+$/,
        /^[0-9]+$/
      ];

      for (let i = 0; i < 4; i++) {
        let mx = sx[i].match(r[i]);
        if (mx && sx[i] === mx[0]) {
          if (Number(sx[i]) === Number(sy[i])) {
            g += 0.25;
          }
        }
      }

      return g === 1.0;
    }

    this.ui.add_test("Compilation", _ => {report.restart(); return this.generic_compile_test()();}, {fail_early: true});
    this.ui.add_test(
      "Test 1 (question)",
      this.simple_equality_test(
        "545648\n",
        "0b10000101001101110000\n\n545648\n\n0x85370\n\n1884489728\n\n",
        { compare_function: numeric_comparison }
      )
    );
    this.ui.add_test(
      "Test 2 (question)",
      this.simple_equality_test(
        "0x545648\n",
        "0b10101000101011001001000\n\n5527112\n\n0x545648\n\n1213617152\n\n",
        { compare_function: numeric_comparison }
      )
    );
    this.ui.add_test(
      "Test 3 (question)",
      this.simple_equality_test(
        "-545648\n",
        "0b11111111111101111010110010010000\n\n-545648\n\n0xfff7ac90\n\n2427254783\n\n",
        { compare_function: numeric_comparison }
      )
    );
    this.ui.add_test(
      "Test 4 (question)",
      this.simple_equality_test(
        "0x80000000\n",
        "0b10000000000000000000000000000000\n\n-2147483648\n\n0x80000000\n\n128\n\n",
        { compare_function: numeric_comparison }
      )
    );
    this.ui.add_test(
      "Test 5",
      this.simple_equality_test(
        "0x7fffffff\n",
        "0b1111111111111111111111111111111\n\n2147483647\n\n0x7fffffff\n\n4294967167\n\n",
        { compare_function: numeric_comparison }
      )
    );
    this.ui.add_test(
      "Test 6",
      this.simple_equality_test(
        "0xffffffff\n",
        "0b11111111111111111111111111111111\n\n-1\n\n0xffffffff\n\n4294967295\n\n",
        { compare_function: numeric_comparison }
      )
    );
    this.ui.add_test(
      "Test 7",
      this.simple_equality_test(
        "0x2a\n",
        "0b101010\n\n42\n\n0x2a\n\n704643072\n\n",
        { compare_function: numeric_comparison }
      )
    );
    this.ui.add_test(
      "Test 8",
      this.simple_equality_test(
        "42\n",
        "0b101010\n\n42\n\n0x2a\n\n704643072\n\n",
        { compare_function: numeric_comparison }
      )
    );
    this.ui.add_test(
      "Test 9",
      this.simple_equality_test(
        "-42\n",
        "0b11111111111111111111111111010110\n\n-42\n\n0xffffffd6\n\n3607101439\n\n",
        { compare_function: numeric_comparison }
      )
    );
    this.ui.add_test(
      "Test 10",
      this.simple_equality_test(
        "0x42\n",
        "0b1000010\n\n66\n\n0x42\n\n1107296256\n\n",
        { compare_function: numeric_comparison }
      )
    );

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
      return `Grade: ${grade}. Download your test report from Assistant execution report <a href=${window.URL.createObjectURL(blob)} download="ex3_1.report">(click here)</a>.`
    }

  }
}

new Ex3_1();


