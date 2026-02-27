
import sys
from pdf2docx import Converter

input_path = sys.argv[1]
output_path = sys.argv[2]

cv = Converter(input_path)
cv.convert(output_path)
cv.close()
