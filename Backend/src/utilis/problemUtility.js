const axios = require('axios');


const getLanguageById = (lang) => {

  const language = {
    "c++": 54,
    "java": 62,
    "javascript": 63
  }


  return language[lang.toLowerCase()];
}

//this function is used to submit the batch of submissions to the judge0 engine
// submission is an array of objects from the userproblem
const submitBatch = async (submissions) => {
  const options = {
    method: 'POST',
    url: `${process.env.JUDGE0_URL || 'http://localhost:2358'}/submissions/batch`,
    params: {
      base64_encoded: 'false'
    },
    headers: {
      'X-Auth-Token': process.env.JUDGE0_AUTH_TOKEN || '',
      'Content-Type': 'application/json'
    },
    data: {
      submissions
    }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  return await fetchData();

}


const waiting = (timer) => {
  return new Promise((resolve) => setTimeout(resolve, timer));
}

// ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]

const submitToken = async (resultToken) => {

  const options = {
    method: 'GET',
    url: `${process.env.JUDGE0_URL || 'http://localhost:2358'}/submissions/batch`,
    params: {
      tokens: resultToken.join(","),
      base64_encoded: 'false',
      fields: '*'
    },
    headers: {
      'X-Auth-Token': process.env.JUDGE0_AUTH_TOKEN || ''
    }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  //true yaani jabtak mujhe result na mile loop chalta rahega
  let retries = 0;
  while (retries < 20) { // maximum wait of 20 seconds
    const result = await fetchData();
    
    // agar result hi undefined aaya hai matlab Judge0 API me issue hai
    if (!result || !result.submissions) {
      throw new Error("Judge0 API failed to return results");
    }

    //agar staus id 2 se zyada hai tabhi result obtined hai nhi to abhi queue me hai 
    const IsResultObtained = result.submissions.every((r) => r.status_id > 2);

    if (IsResultObtained)
      return result.submissions;


    await waiting(1000); //1 second ka wait le rha hu kyuki baar baar call krna
    retries++;
  }
  
  throw new Error("Judge0 API evaluation timed out");



}
const evaluateSubmission = async (language, completeCode, allTestCases) => {
  const language_id = getLanguageById(language);
  
  if (!language_id) {
    return { status: { id: 13, description: "Internal Error" }, compile_output: "Invalid language provided." };
  }

  // 1. Har test case ke liye ek batch submission object taiyar karo
  const submissions = allTestCases.map(testCase => ({
    language_id: language_id,
    source_code: completeCode,
    stdin: testCase.input,
    expected_output: testCase.output
  }));

  // 2. Judge0 ko ek sath saare test cases bhej do
  const batchResponse = await submitBatch(submissions);
  
  if (!batchResponse || batchResponse.error) {
     throw new Error("Failed to submit batch to Judge0");
  }

  // 3. Un sabke tokens nikal lo
  const tokens = batchResponse.map(res => res.token);

  // 4. Jab tak result na aaye, wait karo (Tumhara loop function)
  const results = await submitToken(tokens);

  // 5. Result check karo: Agar ek bhi test case fail hua toh galti pakad lo
  for (const res of results) {
    if (res.status.id !== 3) { // 3 means Accepted
      return res; // Fail wala result return kar do
    }
  }

  // Agar saare test cases pass ho gaye, toh All Clear de do
  return { status: { id: 3, description: "Accepted" } };
};


module.exports = { getLanguageById, submitBatch, submitToken, evaluateSubmission };







// 


