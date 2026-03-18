import sys
import pdfplumber
import pandas as pd

input_path = sys.argv[1]
output_path = sys.argv[2]

all_tables = []
with pdfplumber.open(input_path) as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if table:
                df = pd.DataFrame(table[1:], columns=table[0])
                all_tables.append(df)

if all_tables:
    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        for i, df in enumerate(all_tables):
            df.to_excel(writer, sheet_name=f"Table_{i + 1}", index=False)
else:
    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        pd.DataFrame().to_excel(writer, sheet_name="No_Data", index=False)
