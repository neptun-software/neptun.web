# Regex for replacing dashes with backticks in VSCode

## Find

```text
(?<=\n)---([a-zA-Z]*)\n
```

## Replace

```text
```$1\n
```
