import { UI_Helper, Assistant_Script } from "./modules/assistant.js";
import {LocalReport} from "./modules/connection.js";

class Ex5_2 extends Assistant_Script {
  constructor() {
    super();
    this.ui = new UI_Helper("Exercise 5.2: RISC-V Instruction Encoding");
    let report = new LocalReport();
    this.connections.push(report);

    this.instructions = {
      "lui": ["rd_imm", "U", "0110111"],
      "auipc": ["rd_imm", "U", "0010111"],
      "jal": ["rd_imm", "J", "1101111"],
      "jalr": ["r1_imm_r2", "I", "1100111", "000"],
      "beq": ["r1_r2_imm", "B", "1100011", "000"],
      "bne": ["r1_r2_imm", "B", "1100011", "001"],
      "blt": ["r1_r2_imm", "B", "1100011", "100"],
      "bge": ["r1_r2_imm", "B", "1100011", "101"],
      "bltu": ["r1_r2_imm", "B", "1100011", "110"],
      "bgeu": ["r1_r2_imm", "B", "1100011", "111"],
      "lb": ["r1_imm_r2", "I", "0000011", "000"],
      "lh": ["r1_imm_r2", "I", "0000011", "001"],
      "lw": ["r1_imm_r2", "I", "0000011", "010"],
      "lbu": ["r1_imm_r2", "I", "0000011", "100"],
      "lhu": ["r1_imm_r2", "I", "0000011", "101"],
      "sb": ["r1_imm_r2", "S", "0100011", "000"],
      "sh": ["r1_imm_r2", "S", "0100011", "001"],
      "sw": ["r1_imm_r2", "S", "0100011", "010"],
      "addi": ["r1_r2_imm", "I", "0010011", "000"],
      "slti": ["r1_r2_imm", "I", "0010011", "010"],
      "sltiu": ["r1_r2_imm", "I", "0010011", "011"],
      "xori": ["r1_r2_imm", "I", "0010011", "100"],
      "ori": ["r1_r2_imm", "I", "0010011", "110"],
      "andi": ["r1_r2_imm", "I", "0010011", "111"],
      "slli": ["r1_r2_shamt", "I", "0010011", "001", "0000000"],
      "srli": ["r1_r2_shamt", "I", "0010011", "101", "0000000"],
      "srai": ["r1_r2_shamt", "I", "0010011", "101", "0100000"],
      "add": ["r1_r2_r3", "R", "0110011", "000", "0000000"],
      "sub": ["r1_r2_r3", "R", "0110011", "000", "0100000"],
      "sll": ["r1_r2_r3", "R", "0110011", "001", "0000000"],
      "slt": ["r1_r2_r3", "R", "0110011", "010", "0000000"],
      "sltu": ["r1_r2_r3", "R", "0110011", "011", "0000000"],
      "xor": ["r1_r2_r3", "R", "0110011", "100", "0000000"],
      "srl": ["r1_r2_r3", "R", "0110011", "101", "0000000"],
      "sra": ["r1_r2_r3", "R", "0110011", "101", "0100000"],
      "or": ["r1_r2_r3", "R", "0110011", "110", "0000000"],
      "and": ["r1_r2_r3", "R", "0110011", "111", "0000000"],
    }

    this.ui.add_test(
      "Compilation",
      _ => {
        report.restart();
        return this.generic_compile_test()();
      } , 
      { fail_early: true }
    );
    
    this.ui.add_test(
      "Test 1 - lb (question)",
      this.simple_equality_test(
        "lb x10, 4(x9)\n",
        "0x00448503\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );
    this.ui.add_test(
      "Test 2 - and (question)",
      this.simple_equality_test(
        "and x31, x20, x25\n",
        "0x019A7FB3\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );
    this.ui.add_test(
      "Test 3 - slti (question)",
      this.simple_equality_test(
        "slti x12, x13, -1\n",
        "0xFFF6A613\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );
    this.ui.add_test(
      "Test 4 - bge (question)",
      this.simple_equality_test(
        "bge x7, x0, 256\n",
        "0x1003D063\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );

    this.ui.add_test(
      "Test 5 - jalr (question)",
      this.simple_equality_test(
        "jalr x1, -32(x9)\n",
        "0xFE0480E7\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );

    let test_id = 6; 
    for (const [key, value] of Object.entries(this.instructions)) {
      let random_test = this.generate_test(key, value);
      this.ui.add_test(
        `Test ${test_id} - ${key}`,
        this.simple_equality_test(
          random_test[0],
          random_test[1],
          { compare_function: (a,b) => a.trim() == b.trim() }
        )
      );
      test_id++;
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
        return `Grade: ${grade}. Download your test report from Assistant execution <a href=${window.URL.createObjectURL(blob)} download="ex5_2.report">(click here)</a>.`
      }
  }

  randint(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }


  get_random_values(pattern, inst_type){
    let input, values = {};
    values.r1 = this.randint(0, 32);
    switch (pattern){
      case 'rd_imm':
        if (inst_type == 'U')
          values.imm = this.randint(0, 1048576);
        else
          values.imm = this.randint(-1048576/2, 1048576/2) * 2;
        input = `x${values.r1}, ${values.imm}\n`;
        break;
      case 'r1_imm_r2':
        values.imm = this.randint(-2048, 2047);
        values.r2 = this.randint(0, 32);
        input = `x${values.r1}, ${values.imm}(x${values.r2})\n`;
        break;
      case 'r1_r2_imm':
        values.r2 = this.randint(0, 32);
        if (inst_type == 'B')
          values.imm = this.randint(-4096/2, 4096/2 ) * 2;
        else
          values.imm = this.randint(-2048, 2047);
        input = `x${values.r1}, x${values.r2}, ${values.imm}\n`;
        break;
      case 'r1_r2_shamt':
          values.r2 = this.randint(0, 32);
          values.imm = this.randint(0, 32);
          input = `x${values.r1}, x${values.r2}, ${values.imm}\n`;
          break;
      case 'r1_r2_r3':
        values.r2 = this.randint(0, 32);
        values.r3 = this.randint(0, 32);
        input = `x${values.r1}, x${values.r2}, x${values.r3}\n`;
        break;
      default:
    }
    return [input, values]
  }

  int_to_bin(val, bits){
    return (val >>> 0).toString(2).padStart(bits, '0').slice(-bits);
  }

  encode_R(fixed, values){
    return (
      fixed[2] 
      + this.int_to_bin(values.r3, 5)
      + this.int_to_bin(values.r2, 5)
      + fixed[1]
      + this.int_to_bin(values.r1, 5)
      + fixed[0]
    );
  }
  encode_I(inst, fixed, values){
    let exceptions = ["slli", "srli", "srai"];

    if (exceptions.includes(inst)){
      return (
        fixed[2]
        + this.int_to_bin(values.imm, 5) 
        + this.int_to_bin(values.r2, 5)
        + fixed[1]
        + this.int_to_bin(values.r1, 5)
        + fixed[0]
      );
    }
    return (
      this.int_to_bin(values.imm, 12) 
      + this.int_to_bin(values.r2, 5)
      + fixed[1]
      + this.int_to_bin(values.r1, 5)
      + fixed[0]
    );
  }
  encode_S(fixed, values){
    let imm = this.int_to_bin(values.imm, 12)
    return (
      imm.slice(0, 7) 
      + this.int_to_bin(values.r1, 5) // Store Instructions: r1 = rs2 and r2 = rs1
      + this.int_to_bin(values.r2, 5)
      + fixed[1]
      + imm.slice(7, 12) 
      + fixed[0]
    );
  }
  encode_B(fixed, values){
    let imm = this.int_to_bin(values.imm, 13)
    return (
      imm[0]
      + imm.slice(2, 8)
      + this.int_to_bin(values.r2, 5)
      + this.int_to_bin(values.r1, 5)
      + fixed[1]
      + imm.slice(8, 12)
      + imm[1] 
      + fixed[0]
    );
  }
  
  encode_U(fixed, values){
    let imm = this.int_to_bin(values.imm, 20)
    return (
      imm
      + this.int_to_bin(values.r1, 5)
      + fixed[0]
    );
  }
  encode_J(fixed, values){
      let imm = this.int_to_bin(values.imm, 21)
      return (
        imm[0]
        + imm.slice(10, 20)
        + imm[9]
        + imm.slice(1, 9)
        + this.int_to_bin(values.r1, 5)
        + fixed[0]
      );
    }


  generate_test(inst, spec) {
    let [input, values] = this.get_random_values(spec[0], spec[1]);
    let inst_bin, inst_hex;
    input = `${inst} ${input}`;
    switch (spec[1]){
      case "R":
        inst_bin = this.encode_R(spec.slice(2), values);
        break;
      case "I":
        inst_bin = this.encode_I(inst, spec.slice(2), values);
        break;
      case "S":
        inst_bin = this.encode_S(spec.slice(2), values);
        break;
      case "B":
        inst_bin = this.encode_B(spec.slice(2), values);
        break;
      case "U":
        inst_bin = this.encode_U(spec.slice(2), values);
        break;
      case "J":
        inst_bin = this.encode_J(spec.slice(2), values);
        break;
    }

    inst_hex = "0x" + parseInt(inst_bin, 2).toString(16).toUpperCase().padStart(8, '0');
    return [input, inst_hex + '\n'];

  }
}

new Ex5_2();


