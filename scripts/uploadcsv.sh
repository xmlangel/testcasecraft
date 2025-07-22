curl --location 'http://localhost:8080/api/testcases/import/csv' \
--header 'Authorization: Bearer  eyJhbGciOiJIUzUxMiJ9.eyJyb2xlcyI6W3siYXV0aG9yaXR5IjoiUk9MRV9BRE1JTiJ9XSwic3ViIjoiYWRtaW4iLCJpYXQiOjE3NDcwNDA5MTUsImV4cCI6MTc3ODU3NjkxNX0.9NAdHFmyKole4wEeIzb53kKWYVXKnI-MM8ERDOm1NJ7mOW7kGDJeErEvIEB02AL6wg_q_QDreRHb59jTdCWSGA' \
--form 'file=@test.csv' \
--form 'projectId=d77bc65c-3359-497e-a022-ee3044949ed3' \
--form 'mapping={
  "fieldMappings": {
    "case_id": "id",
    "name": "name",
    "type": "type",
    "description": "description",
    "step1_desc": "steps[0].description",
    "step1_expected": "steps[0].expectedResult",
    "step2_desc": "steps[1].description",
    "step2_expected": "steps[1].expectedResult",
    "parent_id": "parentId"
  },
  "converters": []
}'
