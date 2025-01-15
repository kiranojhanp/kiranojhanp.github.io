# Directory path constants
PUBLIC_DIR := "public"
POSTS_DIR := "src/posts"
CSS_DIR := "src/css"
JS_DIR := "src/js"
IMAGES_DIR := "src/images"
TEMPLATES_DIR := "src/templates"

# Generated directory paths
PUBLIC_POSTS_DIR := PUBLIC_DIR + "/posts"
PUBLIC_CSS_DIR := PUBLIC_DIR + "/css"

# Template paths
POST_TEMPLATE := TEMPLATES_DIR + "/post.html"
HOME_TEMPLATE := TEMPLATES_DIR + "/home.html"

# File patterns
POST_FILES := POSTS_DIR + "/*.md"
PUBLIC_INDEX := PUBLIC_DIR + "/index.html"

# Server settings (localhost)
SERVER_PORT := "8080"

# Default recipe to run when just is called without arguments
default: build

# Build the entire blog
build: clean setup posts index
    @echo "✨ Blog built successfully!"

# Clean the public directory
clean:
    @echo "🧹 Cleaning {{PUBLIC_DIR}} directory..."
    rm -rf {{PUBLIC_DIR}}

# Create necessary directories and copy static files
setup:
    @echo "📁 Setting up directories..."
    mkdir -p {{PUBLIC_POSTS_DIR}}
    cp -r {{CSS_DIR}} {{PUBLIC_DIR}}/
    cp -r {{JS_DIR}} {{PUBLIC_DIR}}/
    cp -r {{IMAGES_DIR}} {{PUBLIC_DIR}}/

# Build all blog posts
posts:
    #!/usr/bin/env bash
    @echo "📝 Building posts..."
    for post in {{POST_FILES}}; do \
        if [ -e "$post" ]; then \
            infile=$(basename "$post"); \
            title_slug=$(basename "$post" .md | sed 's/^[0-9\-]*//'); \
            outfile="$title_slug.html"; \
            echo " Building $infile -> $outfile"; \
            pandoc "$post" \
                --template={{POST_TEMPLATE}} \
                --variable year="$(date +%Y)" \
                -o "{{PUBLIC_POSTS_DIR}}/$outfile"; \
        fi; \
    done

# Build the index page
index:
    #!/usr/bin/env bash
    echo "🏠 Building index page..."
    {
        echo "---"
        echo "year: $(date +%Y)"
        echo "posts:"
        for post in {{POST_FILES}}; do \
            if [ -e "$post" ]; then \
                title_slug=$(basename "$post" .md | sed 's/^[0-9\-]*//'); \
                date=$(grep -m 1 "date:" "$post" | cut -d' ' -f2); \
                title=$(grep -m 1 "title:" "$post" | cut -d':' -f2- | sed 's/^[ ]*//'); \
                echo "  - date: \"$date\""
                echo "    title: \"$title\""
                echo "    url: \"/posts/$title_slug.html\""
            fi; \
        done
        echo "---"
    } > temp_home.md
    echo " Generated temporary index content:"
    cat temp_home.md
    pandoc temp_home.md \
        --template={{HOME_TEMPLATE}} \
        -o {{PUBLIC_INDEX}}
    rm temp_home.md

# Serve the blog locally using Python's built-in server
serve: build
    @echo "🌎 Starting local server..."
    cd {{PUBLIC_DIR}} && python3 -m http.server {{SERVER_PORT}}

# Create a new blog post with today's date
new-post title:
    #!/usr/bin/env bash
    @echo "📝 Creating new post: {{title}}"
    slug=$(echo "{{title}}" | tr '[:upper:] ' '[:lower:]-' | sed 's/[^a-z0-9-]//g'); \
    date=$(date +%Y-%m-%d); \
    post_file="{{POSTS_DIR}}/$date-$slug.md"; \
    echo "---" > "$post_file"; \
    echo "title: {{title}}" >> "$post_file"; \
    echo "date: $date" >> "$post_file"; \
    echo "---" >> "$post_file"; \
    echo "\nWrite your post here..." >> "$post_file"; \
    echo "Created $post_file"

# List all available posts
list:
    #!/usr/bin/env bash
    @echo "📚 Available posts:"
    for post in {{POST_FILES}}; do \
        if [ -e "$post" ]; then \
            date=$(grep -m 1 "date:" "$post" | cut -d' ' -f2); \
            title=$(grep -m 1 "title:" "$post" | cut -d':' -f2- | sed 's/^[ ]*//' ); \
            echo " $date - $title"; \
        fi; \
    done

# Show help
help:
    @echo "Available commands:"
    @echo " just build - Build the entire blog"
    @echo " just clean - Clean the {{PUBLIC_DIR}} directory"
    @echo " just serve - Build and serve the blog locally"
    @echo " just new-post - Create a new blog post (e.g., just new-post \"My New Post\")"
    @echo " just list - List all available posts"