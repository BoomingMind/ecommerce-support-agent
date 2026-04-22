from backend.src.api.main import graph

def generate_image():
    # Render the graph as a PNG image using built-in Mermaid renderer
    image_bytes = graph.get_graph().draw_mermaid_png()
    
    # Save the bytes to a file
    with open("agent_graph.png", "wb") as file:
        file.write(image_bytes)
        
    print("Graph image saved as agent_graph.png!")

if __name__ == "__main__":
    generate_image()
