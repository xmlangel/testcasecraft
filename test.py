import csv

def tsv_to_csv_with_multiline(src_path, dst_path):
    with open(src_path, 'r', encoding='utf-8') as src, open(dst_path, 'w', encoding='utf-8', newline='') as dst:
        reader = csv.reader(src, delimiter='\t')
        writer = csv.writer(dst, quoting=csv.QUOTE_ALL)
        
        # 헤더 변환
        headers = next(reader)
        csv_headers = [
            'name', 'type', 'description', 'preCondition', 'step1', 'expectedResults'
        ]
        writer.writerow(csv_headers)
        
        for row in reader:
            # paste.txt는 4개 컬럼: TestCaseName, Precondition, Steps, ExpectedResult
            # type, step1, expectedResults는 변환 규칙에 따라 생성
            name = row[0].strip()
            description = row[1].strip() if len(row) > 1 else ''
            precondition = row[2].strip() if len(row) > 2 else ''
            step1 = row[3].strip() if len(row) > 3 else ''
            expected_result = row[4].strip() if len(row) > 4 else ''
            
            # type은 testcase로 고정
            writer.writerow([
                name,
                'testcase',
                description,
                precondition,
                step1,
                expected_result
            ])

# 사용 예시
tsv_to_csv_with_multiline('paste.txt', 'ahm-notifications.csv')
