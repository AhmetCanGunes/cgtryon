#!/usr/bin/env python3
"""
Refactor WomensFashionMode.tsx to Studio-style layout
"""
import re

def find_mode_boundaries(lines):
    """Find where each production mode starts and ends"""
    boundaries = {}

    for i, line in enumerate(lines):
        if '{productionMode === \'standard\' ? (' in line:
            boundaries['standard_start'] = i
        elif ') : productionMode === \'referenced\' ? (' in line:
            boundaries['referenced_start'] = i
        elif ') : productionMode === \'scene\' ? (' in line:
            boundaries['scene_start'] = i
        elif ') : productionMode === \'preset\' ? (' in line:
            boundaries['preset_start'] = i

    return boundaries

def extract_mode_sections(lines, mode_start, mode_end):
    """Extract settings, generate button, and results sections for a mode"""
    mode_lines = lines[mode_start:mode_end]

    # Find left panel (settings)
    left_panel_start = None
    left_panel_end = None
    generate_btn_start = None
    generate_btn_end = None
    results_start = None
    results_end = None

    for i, line in enumerate(mode_lines):
        if '{/* Left Panel */}' in line or 'lg:col-span-1' in line:
            if left_panel_start is None:
                left_panel_start = i
        elif '{/* Generate Button */}' in line or 'onClick={handleShowPromptPreview}' in line or 'onClick={handleGenerate}' in line:
            if generate_btn_start is None:
                left_panel_end = i
                generate_btn_start = i
        elif '{/* Right Panel' in line or 'lg:col-span-2' in line:
            if results_start is None:
                generate_btn_end = i
                results_start = i
                results_end = len(mode_lines) - 2  # Approximate end

    return {
        'settings': mode_lines[left_panel_start:left_panel_end] if left_panel_start else [],
        'generate': mode_lines[generate_btn_start:generate_btn_end] if generate_btn_start else [],
        'results': mode_lines[results_start:results_end] if results_start else []
    }

def clean_settings_wrapper(settings_lines):
    """Remove grid wrappers from settings"""
    cleaned = []
    skip_next = False

    for line in settings_lines:
        # Skip grid container lines
        if any(x in line for x in [
            'grid grid-cols-1 lg:grid-cols-3',
            '<div className="lg:col-span-1 space-y-3">',
            'lg:col-span-1'
        ]):
            continue
        cleaned.append(line)

    return cleaned

def clean_results_wrapper(results_lines):
    """Remove grid wrappers from results"""
    cleaned = []

    for line in results_lines:
        # Skip the col-span-2 wrapper opening
        if '<div className="lg:col-span-2">' in line:
            continue
        cleaned.append(line)

    return cleaned

def create_sidebar_tabs():
    """Create the new Studio-style tab navigation"""
    return """        {/* Tab Navigation - Studio Style */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setProductionMode('standard')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium transition-all border-b-2 ${
              productionMode === 'standard'
                ? 'border-pink-500 text-pink-600 bg-pink-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <DressIcon className="w-3.5 h-3.5" />
            <span>Standart</span>
          </button>
          <button
            onClick={() => setProductionMode('referenced')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium transition-all border-b-2 ${
              productionMode === 'referenced'
                ? 'border-pink-500 text-pink-600 bg-pink-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ReferenceIcon className="w-3.5 h-3.5" />
            <span>Referanslı</span>
          </button>
          <button
            onClick={() => setProductionMode('scene')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium transition-all border-b-2 ${
              productionMode === 'scene'
                ? 'border-pink-500 text-pink-600 bg-pink-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SceneIcon className="w-3.5 h-3.5" />
            <span>Sahneye Yerleştir</span>
          </button>
          <button
            onClick={() => setProductionMode('preset')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium transition-all border-b-2 ${
              productionMode === 'preset'
                ? 'border-pink-500 text-pink-600 bg-pink-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <PresetIcon className="w-3.5 h-3.5" />
            <span>Hazır Sahneler</span>
          </button>
        </div>

"""

def main():
    input_file = '/Users/ahmetcangunes/Desktop/kaapp/components/WomensFashionMode.tsx'
    output_file = '/Users/ahmetcangunes/Desktop/kaapp/components/WomensFashionMode.tsx.new'

    # Read file
    with open(input_file, 'r') as f:
        lines = f.readlines()

    print(f"Read {len(lines)} lines")

    # Find key line numbers
    return_line = None
    header_start = None
    header_end = None
    tab_start = None
    tab_end = None
    hidden_start = None
    hidden_end = None

    for i, line in enumerate(lines):
        if 'return (' in line and i > 700 and i < 800:
            return_line = i
        elif '{/* Compact Header */}' in line:
            header_start = i
        elif header_start and '</div>' in line and i - header_start < 20 and not header_end:
            header_end = i
        elif '{/* Mod Seçimi Sekmeleri */}' in line:
            tab_start = i
        elif tab_start and '</div>' in line and 'mb-4' in lines[tab_start] and not tab_end:
            tab_end = i
        elif '{/* Hidden file inputs */}' in line:
            hidden_start = i

    # Find end of hidden inputs
    if hidden_start:
        for i in range(hidden_start, hidden_start + 20):
            if 'customBackgroundInputRef' in lines[i]:
                hidden_end = i
                break

    # Find production modes
    boundaries = find_mode_boundaries(lines)

    print(f"Return line: {return_line + 1}")
    print(f"Header: {header_start + 1} to {header_end + 1}")
    print(f"Tabs: {tab_start + 1} to {tab_end + 1}")
    print(f"Hidden inputs: {hidden_start + 1} to {hidden_end + 1}")
    print(f"Boundaries: {boundaries}")

    # Start building output
    output = []

    # 1. Everything before return statement
    output.extend(lines[:return_line + 1])

    # 2. New main container
    output.append("    <div className=\"h-full flex bg-gray-100\">\n")
    output.append("      {/* LEFT SIDEBAR */}\n")
    output.append("      <aside className=\"w-[420px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full\">\n")

    # 3. Tab navigation
    output.append(create_sidebar_tabs())

    # 4. Hidden file inputs
    if hidden_start and hidden_end:
        output.extend(lines[hidden_start:hidden_end + 1])
        output.append("\n")

    # 5. Scrollable content wrapper
    output.append("        {/* Scrollable Content - Settings Only */}\n")
    output.append("        <div className=\"flex-1 overflow-y-auto\">\n")

    # Process each mode
    modes = ['standard', 'referenced', 'scene', 'preset']
    for idx, mode in enumerate(modes):
        mode_start_key = f'{mode}_start'
        if mode_start_key in boundaries:
            mode_start = boundaries[mode_start_key]
            # Find mode end (next mode start or end of file)
            if idx < len(modes) - 1:
                next_mode = modes[idx + 1]
                next_mode_key = f'{next_mode}_start'
                mode_end = boundaries.get(next_mode_key, len(lines) - 10)
            else:
                mode_end = len(lines) - 10

            print(f"\nProcessing {mode} mode: {mode_start + 1} to {mode_end + 1}")

            # Find sections within this mode
            sections = extract_mode_sections(lines, mode_start, mode_end)

            # Add mode condition
            if idx == 0:
                output.append("          {productionMode === 'standard' ? (\n")
            else:
                output.append(f"          ) : productionMode === '{mode}' ? (\n")

            output.append("            <div className=\"p-4 space-y-3\">\n")

            # Add cleaned settings
            if sections['settings']:
                cleaned_settings = clean_settings_wrapper(sections['settings'])
                # Remove first few wrapper divs
                start_adding = False
                for line in cleaned_settings:
                    if not start_adding and ('{/*' in line or 'bg-white rounded-xl' in line):
                        start_adding = True
                    if start_adding:
                        output.append(line)

            output.append("            </div>\n")

    # Close the modes conditional
    output.append("          ) : null}\n")

    # 6. Close scrollable content
    output.append("        </div>\n\n")

    # 7. Sticky footer with generate button
    output.append("        {/* Sticky Footer */}\n")
    output.append("        <div className=\"flex-shrink-0 p-4 border-t border-gray-200 bg-white\">\n")

    # Add generate button for each mode
    for idx, mode in enumerate(modes):
        mode_start_key = f'{mode}_start'
        if mode_start_key in boundaries:
            mode_start = boundaries[mode_start_key]
            if idx < len(modes) - 1:
                next_mode = modes[idx + 1]
                next_mode_key = f'{next_mode}_start'
                mode_end = boundaries.get(next_mode_key, len(lines) - 10)
            else:
                mode_end = len(lines) - 10

            sections = extract_mode_sections(lines, mode_start, mode_end)

            if idx == 0:
                output.append("          {productionMode === 'standard' ? (\n")
                output.append("            <>\n")
            else:
                output.append(f"          ) : productionMode === '{mode}' ? (\n")
                output.append("            <>\n")

            # Add generate button and progress/error
            if sections['generate']:
                for line in sections['generate']:
                    if 'Generate Button' not in line and 'Left Panel' not in line:
                        output.append("  " + line)

            output.append("            </>\n")

    output.append("          ) : null}\n")
    output.append("        </div>\n")
    output.append("      </aside>\n\n")

    # 8. Main content area with results
    output.append("      {/* MAIN CONTENT */}\n")
    output.append("      <main className=\"flex-1 p-6 overflow-y-auto bg-gray-100\">\n")

    # Add results for each mode
    for idx, mode in enumerate(modes):
        mode_start_key = f'{mode}_start'
        if mode_start_key in boundaries:
            mode_start = boundaries[mode_start_key]
            if idx < len(modes) - 1:
                next_mode = modes[idx + 1]
                next_mode_key = f'{next_mode}_start'
                mode_end = boundaries.get(next_mode_key, len(lines) - 10)
            else:
                mode_end = len(lines) - 10

            sections = extract_mode_sections(lines, mode_start, mode_end)

            if idx == 0:
                output.append("        {productionMode === 'standard' ? (\n")
            else:
                output.append(f"        ) : productionMode === '{mode}' ? (\n")

            # Add results
            if sections['results']:
                cleaned_results = clean_results_wrapper(sections['results'])
                for line in cleaned_results:
                    output.append(line)

    output.append("        ) : null}\n")
    output.append("      </main>\n")

    # 9. Close main container
    output.append("    </div>\n")

    # 10. Add remaining lines (closing component, etc.)
    # Find where the final return closes
    final_close = None
    for i in range(len(lines) - 1, boundaries.get('standard_start', 0), -1):
        if '};' in lines[i] and 'export default' in lines[i + 1]:
            final_close = i
            break

    if final_close:
        output.extend(lines[final_close:])

    # Write output
    with open(output_file, 'w') as f:
        f.writelines(output)

    print(f"\nWrote {len(output)} lines to {output_file}")
    print("Review the output and then run: mv WomensFashionMode.tsx.new WomensFashionMode.tsx")

if __name__ == '__main__':
    main()
