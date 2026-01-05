A weighted system is smart because it mimics how a designer thinks. A designer doesn't just say "Yes/No"; they say, *"This is a 95% match because it's perfect for your light, but a 60% match because it might be too bold."*

Since you want **Percentages**, I recommend a **"Target Score" System**. We assign a max point value (100 points) divided across the categories that matter most.

Here is the **"Color Match Formula"** you can hand to Claude. It breaks down the decision into 4 weighted buckets.

### **The "Color Edit" Weighted Algorithm**

This system sums up to **100 Points**.

| Category | Weight (Points) | Why it matters |
| :---- | :---- | :---- |
| **1\. Boldness (Chroma)** | **35 Points** | The biggest fail point. If they want "Timeless" and get "Neon," the app failed. |
| **2\. Vibe (Depth & Temp)** | **25 Points** | Does it *feel* right? (Moody, Cozy, Crisp). |
| **3\. Lighting (LRV)** | **20 Points** | Will the color actually show up or die in the shadows? |
| **4\. Harmony (Direction)** | **20 Points** | Does it fix their North/South light issues? |
| **5\. Avoid List** | **(Kill Switch)** | If it hits an "Avoid" tag, Score \= 0%. |

### ---

**The Python Logic for Claude**

Copy and paste this script. It implements the weighted system above and returns a clean "Match Percentage" (e.g., *"92% Match"*).

Python

def calculate\_weighted\_match(user\_answers, color\_db):  
    scored\_results \= \[\]

    \# \--- DEFINING THE WEIGHTS \---  
    WEIGHTS \= {  
        "boldness": 35,  
        "vibe": 25,  
        "light\_level": 20,  
        "harmony": 20  
    }

    for color in color\_db:  
        score \= 0  
        max\_score \= 100  
          
        \# \---------------------------------------------------------  
        \# 1\. KILL SWITCH (The "Avoid" Filter)  
        \# \---------------------------------------------------------  
        \# If user says "Avoid Purple" and color is Purple, immediate 0%  
        if "purple" in user\_answers\['avoid'\] and ("purple" in color\['Risk\_tags'\] or "Purple" in color\['Family'\]):  
            scored\_results.append({'color': color, 'match\_percent': 0, 'reason': 'Avoided Purple'})  
            continue  
        if "yellow" in user\_answers\['avoid'\] and "yellow" in color\['Risk\_tags'\]:  
            scored\_results.append({'color': color, 'match\_percent': 0, 'reason': 'Avoided Yellow Risks'})  
            continue  
          
        \# \---------------------------------------------------------  
        \# 2\. BOLDNESS MATCH (35 Points)  
        \# \---------------------------------------------------------  
        \# Logic: Compare User's "Boldness" preference to Color's "Chroma"  
        chroma \= color\['Chroma'\]  
        user\_boldness \= user\_answers\['boldness'\] \# Timeless, Soft, Statement  
          
        if user\_boldness \== 'Timeless':  
            if chroma \< 12: score \+= 35       \# Perfect match  
            elif chroma \< 18: score \+= 15     \# Okay, but maybe too colorful  
            else: score \+= 0                  \# Too bold  
              
        elif user\_boldness \== 'A Little Color':  
            if 12 \<= chroma \<= 30: score \+= 35  
            elif chroma \< 12: score \+= 10     \# Too boring?  
            else: score \+= 10                 \# Too bold?  
              
        elif user\_boldness \== 'Statement':  
            if chroma \> 30: score \+= 35  
            elif chroma \> 20: score \+= 20  
            else: score \+= 0                  \# Too boring

        \# \---------------------------------------------------------  
        \# 3\. VIBE MATCH (25 Points)  
        \# \---------------------------------------------------------  
        \# Logic: Match "Mood" to Depth and Temp  
        vibe \= user\_answers\['vibe'\]  
          
        if vibe \== 'Moody & Dramatic':  
            if color\['Depth\_bin'\] in \['Very Deep', 'Deep'\]: score \+= 25  
            elif color\['Depth\_bin'\] \== 'Mid-Depth': score \+= 10  
              
        elif vibe \== 'Clean & Crisp':  
            if color\['Depth\_bin'\] \== 'Light': score \+= 25  
            if color\['Temp'\] \== 'Cool': score \+= 5  \# Bonus for crisp cool tones  
              
        elif vibe \== 'Cozy & Warm':  
            if color\['Temp'\] \== 'Warm': score \+= 25  
            elif color\['Temp'\] \== 'Neutral': score \+= 15

        \# \---------------------------------------------------------  
        \# 4\. LIGHTING SAFETY (20 Points)  
        \# \---------------------------------------------------------  
        \# Logic: Don't recommend dark colors in low light (unless asked for)  
        light\_level \= user\_answers\['light\_level'\]  
        lrv \= color\['LRV'\]  
          
        if light\_level \== 'Low':  
            \# In low light, high LRV is safe. Low LRV is risky unless "Moody".  
            if vibe \== 'Moody & Dramatic':   
                score \+= 20 \# They want dark in dark, that's fine.  
            else:  
                if lrv \> 50: score \+= 20  
                elif lrv \> 30: score \+= 10  
                else: score \+= 0 \# Too dark for this room  
        else:  
            \# Lots of light? Anything goes.  
            score \+= 20

        \# \---------------------------------------------------------  
        \# 5\. HARMONY / DIRECTION (20 Points)  
        \# \---------------------------------------------------------  
        \# Logic: North light needs warmth; Fixed elements need harmony.  
        direction \= user\_answers\['direction'\] \# North, South, East, West  
          
        if direction \== 'North': \# Cool Light  
            if color\['Temp'\] \== 'Warm': score \+= 20 \# Balances the blue light  
            elif color\['Temp'\] \== 'Neutral': score \+= 10  
            elif color\['Temp'\] \== 'Cool': score \+= 0 \# Might feel icy  
              
        elif direction \== 'South': \# Warm Light  
            if color\['Temp'\] in \['Cool', 'Neutral'\]: score \+= 20 \# Balances yellow light  
            else: score \+= 10 \# Warm is fine, just intense.

        \# \---------------------------------------------------------  
        \# FINAL CALCULATION  
        \# \---------------------------------------------------------  
        scored\_results.append({  
            'color': color,   
            'match\_percent': score, \# Since max is 100, score IS the percent  
            'match\_details': f"Scored {score}/100"  
        })

    \# Sort by highest match %  
    return sorted(scored\_results, key=lambda x: x\['match\_percent'\], reverse=True)\[:5\]

### **How to explain this to the User (on the Result Card)**

When the app shows the result, you can use these points to generate a dynamic sentence:

"95% Match"  
"This color is a perfect match for your Timeless style (+35%) and brings the Warmth you need (+25%) to balance your North-facing room (+20%)."

This makes the user feel *heard* rather than just processed by a computer.