https://hassaan-hub.github.io/MaintainIQ/


MaintainIQ — Smart Maintenance Management Platform
MaintainIQ ek professional maintenance-management web application hai jo institutions, offices, aur organizations ke physical assets (jaise machines, equipment, AC units, generators, etc.) ko digitally track aur manage karne ke liye banaya gaya hai. Har asset ko ek unique digital identity aur QR code milta hai, jisse koi bhi employee ya technician sirf scan kar ke us asset ki poori details, current status, aur maintenance history dekh sakta hai — ya seedha issue report kar sakta hai, bina kisi manual form ya phone call ke.
Core Features:

QR-Enabled Assets — Har asset ka apna unique QR code hota hai. Scan karte hi asset details, status, aur report option turant mil jata hai.
Smart Issue Triage — Reported issues automatically categorize aur prioritize hote hain (low, medium, high, critical), taake admins sahi technician ko sahi kaam assign kar sakein.
8-Step Issue Workflow — Har issue ek defined lifecycle follow karta hai: Reported → Triaged → Assigned → In Progress → Resolved → Closed (with rejection handling bhi included).
Evidence-Backed Resolution — Technicians repair complete karne ke baad photos aur notes upload karte hain proof ke taur pe — koi issue sirf "mark as done" nahi hota, har action verified hota hai.
Full Service History Logging — Har asset ki poori maintenance history permanently store hoti hai — kab kya hua, kisne kiya, kya notes thay — sab kuch traceable.
Preventive Maintenance Alerts — System automatically pattern detect karta hai (jaise ek asset mein baar baar issues aa rahe hon, ya warranty expire hone wali ho) aur admins ko proactively alert karta hai.
Role-Based Access Control — 4 alag roles: Admin, Manager, Technician, aur Public — har role ko sirf uske relevant features aur data tak access milta hai.
Real-Time Dashboard — Live stats (total assets, open issues, resolved issues, critical alerts) Firestore ke real-time listeners (onSnapshot) se update hote hain, bina page refresh kiye.
Cloudinary Image Uploads — Asset photos, issue evidence, aur repair proof images Cloudinary API ke through upload aur manage hote hain.
Technician Workload View — Managers dekh sakte hain kis technician ke paas kitne assigned, in-progress, aur resolved (last 30 days) issues hain — resource allocation ke liye.

Tech Stack: HTML5, Tailwind CSS, Vanilla JavaScript (ES6 Modules), Firebase Authentication, Firestore Database, Firebase Storage, Cloudinary API — production-grade, fully responsive, aur scalable architecture ke saath banaya gaya hai.
