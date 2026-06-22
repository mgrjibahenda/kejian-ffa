import json
old_val = open("blade_old_val.txt", encoding="utf-8").read()
newobj = json.load(open("blade_new.json", encoding="utf-8"))
new_val = json.dumps(newobj, ensure_ascii=False, separators=(",",":"))
data = open("index.html", encoding="utf-8").read()
# current value in file is the previous new_val; recompute it from blade_new_val.txt
prev_val = open("blade_new_val.txt", encoding="utf-8").read()
assert data.count(prev_val) == 1, "expected exactly one prev value, got %d" % data.count(prev_val)
data = data.replace(prev_val, new_val)
open("index.html","w",encoding="utf-8",newline="").write(data)
open("blade_new_val.txt","w",encoding="utf-8").write(new_val)
print("replaced; new size", len(data))
