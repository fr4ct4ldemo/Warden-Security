import re
from pathlib import Path

ROOT = Path(r'c:\Users\Admin\OneDrive\Documents\project2.0')
GROUPS = {
    ROOT / 'commands' / 'moderation2' / 'punish.js': ROOT / 'commands' / 'moderation',
    ROOT / 'commands' / 'moderation3' / 'manage.js': ROOT / 'commands' / 'moderation',
    ROOT / 'commands' / 'moderation4' / 'moderate.js': ROOT / 'commands' / 'moderation',
    ROOT / 'commands' / 'security2' / 'security.js': ROOT / 'commands' / 'security',
}


def parse_addsubcommands(text):
    subs = {}
    pattern = re.compile(r"\.addSubcommand\s*\(\s*s\s*=>\s*s")
    for m in pattern.finditer(text):
        start = m.start()
        i = text.find('(', start)
        if i < 0:
            continue
        depth = 0
        end = i
        while end < len(text):
            ch = text[end]
            if ch == '(':
                depth += 1
            elif ch == ')':
                depth -= 1
                if depth == 0:
                    break
            end += 1
        block = text[start:end+1]
        name_match = re.search(r"setName\((['\"])([^'\"]+)\1\)", block)
        if not name_match:
            continue
        name = name_match.group(2)
        inner = re.sub(r'^\s*\.addSubcommand\s*\(\s*s\s*=>\s*s', '', block, count=1)
        if inner.strip().endswith(')'):
            inner = inner.rstrip()[:-1]
        inner = inner.rstrip(',\n')
        subs[name] = {'builder': inner.strip(), 'name': name}
    return subs


def parse_if_blocks(text):
    subs = {}
    pattern = re.compile(r"if\s*\(\s*sub\s*===\s*(['\"])([^'\"]+)\1\s*\)\s*\{")
    for m in pattern.finditer(text):
        name = m.group(2)
        start = text.find('{', m.end()-1)
        if start < 0:
            continue
        depth = 0
        end = start
        while end < len(text):
            ch = text[end]
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    break
            end += 1
        body = text[start+1:end]
        subs[name] = {'body': body.strip(), 'name': name}
    return subs


def detect_imports(builder, body, default_error=True):
    need_db = 'db.' in builder or 'db.' in body
    need_success = 'successEmbed' in builder or 'successEmbed' in body
    need_error = default_error or 'errorEmbed' in builder or 'errorEmbed' in body
    need_check = 'checkPermissions' in builder or 'checkPermissions' in body
    need_log = 'logAction' in builder or 'logAction' in body
    need_ch = 'ChannelType' in builder or 'ChannelType' in body
    need_pf = 'PermissionFlagsBits' in builder or 'PermissionFlagsBits' in body
    return need_db, need_success, need_error, need_check, need_log, need_ch, need_pf


def make_command_file(name, out_dir, builder, body, use_imports):
    db, success, error, check, log, ch, pf = use_imports
    imports = ["'use strict';"]
    discord_items = ['SlashCommandBuilder']
    if ch:
        discord_items.append('ChannelType')
    if pf:
        discord_items.append('PermissionFlagsBits')
    imports.append(f"const {{ {', '.join(discord_items)} }} = require('discord.js');")
    if db:
        imports.append("const db = require('../../utils/database');")
    if success or error:
        items = []
        if success:
            items.append('successEmbed')
        if error:
            items.append('errorEmbed')
        imports.append(f"const {{ {', '.join(items)} }} = require('../../utils/embedBuilder');")
    if check:
        imports.append("const { checkPermissions } = require('../../utils/permissionCheck');")
    if log:
        imports.append("const { logAction } = require('../../utils/logger');")
    imports_text = '\n'.join(imports)

    builder_lines = builder.splitlines()
    builder_clean = '\n'.join(line.rstrip() for line in builder_lines)
    file_body = []
    file_body.append(imports_text)
    file_body.append('')
    file_body.append('module.exports = {')
    file_body.append('  data: new SlashCommandBuilder()')
    for line in builder_clean.splitlines():
        file_body.append('    ' + line.strip())
    file_body.append('  ,')
    file_body.append('  async execute(interaction, client) {')
    file_body.append('    try {')
    file_body.append('      await interaction.deferReply();')
    if 'guildId' in body:
        file_body.append('      const guildId = interaction.guild.id;')
    if body:
        for line in body.splitlines():
            if line.strip() == '':
                file_body.append('')
            else:
                file_body.append('      ' + line.lstrip())
    file_body.append('    } catch (err) {')
    if error:
        file_body.append('      console.error(err);')
        file_body.append("      await interaction.editReply({ embeds: [errorEmbed('❌ Error', 'An unexpected error occurred.')] });")
    else:
        file_body.append('      console.error(err);')
        file_body.append("      await interaction.editReply({ content: 'An unexpected error occurred.' });")
    file_body.append('    }')
    file_body.append('  }')
    file_body.append('};')
    return '\n'.join(file_body) + '\n'


def main():
    for group_file, target_dir in GROUPS.items():
        print(f'Processing {group_file} -> {target_dir}')
        txt = Path(group_file).read_text(encoding='utf-8')
        build_start = txt.find('data: new SlashCommandBuilder()')
        if build_start < 0:
            raise SystemExit('No builder found in ' + str(group_file))
        execute_start = txt.find('async execute')
        if execute_start < 0:
            raise SystemExit('No execute found in ' + str(group_file))
        builder_text = txt[build_start:execute_start]
        execute_text = txt[execute_start:]

        addsubs = parse_addsubcommands(builder_text)
        blocks = parse_if_blocks(execute_text)
        if not addsubs:
            raise SystemExit('No subcommands parsed from ' + str(group_file))

        Path(target_dir).mkdir(parents=True, exist_ok=True)
        for name, info in addsubs.items():
            body = blocks.get(name, {}).get('body', '')
            builder = info['builder']
            use_imports = detect_imports(builder, body)
            content = make_command_file(name, target_dir, builder, body, use_imports)
            out_path = Path(target_dir) / f'{name}.js'
            out_path.write_text(content, encoding='utf-8')
            print(f'Wrote {out_path}')

    print('Done generating standalone command files.')


if __name__ == '__main__':
    main()
