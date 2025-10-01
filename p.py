import os

# Глобальный список исключаемых директорий
EXCLUDE_DIRS = ['node_modules', '.git', 'dist', '.next']

def generate_directory_tree(start_path, output_file, exclude_dirs=None):
    """
    Генерирует дерево каталогов и пишет его в выходной файл.
    """
    if exclude_dirs is None:
        exclude_dirs = EXCLUDE_DIRS

    output_file.write("# Project Directory Structure\n\n")

    for root, dirs, files in os.walk(start_path):
        # Исключаем ненужные папки
        dirs[:] = [d for d in dirs if d not in exclude_dirs]

        # Уровень вложенности
        level = root.replace(start_path, '').count(os.sep)
        indent = '  ' * level

        # Относительный путь
        rel_path = os.path.relpath(root, start_path)
        if rel_path == '.':
            output_file.write(f"{indent}📁 ./\n")
        else:
            dir_name = os.path.basename(root)
            output_file.write(f"{indent}📁 {dir_name}/\n")

        # Файлы
        sub_indent = '  ' * (level + 1)
        for file in sorted(files):
            # Исправленная строка: убраны лишние символы ```
            if file.endswith(('.tsx', '.ts', '.json', '.js', '.css', '.html', '.png')):
                output_file.write(f"{sub_indent}📄 {file}\n")

    output_file.write("\n\n# File Contents\n\n")


def main():
    # Текущая директория
    current_directory = os.getcwd()

    # Имя выходного файла
    output_filename = 'files_with_code.txt'

    with open(output_filename, 'w', encoding='utf-8') as output:
        # Генерируем дерево каталогов
        generate_directory_tree(current_directory, output, EXCLUDE_DIRS)

        # Записываем содержимое файлов
        for root, dirs, files in os.walk(current_directory):
            # Исключаем ненужные папки
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            for filename in files:
                # Мы не записываем содержимое png, только текстовые файлы
                if filename.endswith(('.tsx', '.ts', '.json', '.js', '.css', '.html')):
                    if "package-lock" in filename:
                        continue

                    # Относительный путь
                    rel_path = os.path.relpath(os.path.join(root, filename), current_directory)

                    # Заголовок файла
                    output.write(f'File: {rel_path}\n')
                    output.write('=' * 80 + '\n')

                    file_path = os.path.join(root, filename)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as file:
                            code = file.read()
                            output.write(code + '\n\n')
                            output.write('-' * 80 + '\n\n')
                    except Exception as e:
                        output.write(f'Не удалось прочитать файл {rel_path}: {e}\n\n')
                        output.write('-' * 80 + '\n\n')

    print(f'Дерево каталогов и код файлов записаны в {output_filename}')


if __name__ == "__main__":
    main()