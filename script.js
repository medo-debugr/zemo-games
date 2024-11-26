// لا حاجة الآن لاحتساب السلة أو إضافة العناصر لها
let cartCount = 0;
const cartCountElement = document.getElementById("cart-count");

// إضافة الأحداث الخاصة بـ "أضف إلى السلة" تم حذفها حيث أنه لا توجد منتجات حالياً

// إنشاء الأداة (slider)
CreateSlider(document.getElementById("slider-container"), 300);

function CreateSlider(parent, width = 300) {
    var sliderContainer = parent.appendChild(document.createElement("div"));
    sliderContainer.classList.add("sliderContainer");
    sliderContainer.style.position = "relative";
    
    var slider = sliderContainer.appendChild(document.createElement("input"));
    slider.type = "range";
    slider.value = Math.random() * 100;
    slider.min = 0;
    slider.max = 100;
    slider.style.width = width + "px";
    slider.style["-webkit-appearance"] = "none";

    var points = [];
    var arms = [];
    
    var br = sliderContainer.getBoundingClientRect();
    var ropeLength = br.width * 0.4;
    var nrSegments = 15;

    // إنشاء النقاط
    for (var i = 0; i < nrSegments + 1; i++) {
        points.push(new Point(i * (ropeLength / nrSegments), br.height / 2, i == 0 || i == nrSegments));
    }

    // إنشاء الأذرع
    for (var i = 0; i < nrSegments; i++) {
        arms.push(new Arm(points[i], points[i + 1], sliderContainer));
    }

    var endPointIndex = points.length - 1;
    var endPoint = points[endPointIndex];
    
    slider.oninput = function() {
        setEndPoint();
        updateBackground(slider.value);
    };
    
    setEndPoint();

    function setEndPoint() {
        endPoint.x = map(slider.value, parseFloat(slider.min) || 0, parseFloat(slider.max) || 100, 10, br.width - 10);
        endPoint.y = br.height / 2;
    }

    function loop() {
        for (var i = 0; i < 5; i++) {
            for (var arm of arms) {
                arm.update();
            }
        }

        for (var point of points) {
            point.update();
        }

        for (var arm of arms) {
            arm.updateElement();
        }

        requestAnimationFrame(loop);
    }

    // تغيير الخلفية بناءً على قيمة الشريط
    function updateBackground(value) {
        if (value <= 33) {
            document.body.style.backgroundColor = "#ffffff"; // أبيض
        } else if (value <= 66) {
            document.body.style.backgroundColor = "#000000"; // أسود
        } else {
            document.body.style.backgroundColor = "#ffa500"; // برتقالي
        }
    }

    // دالة لإنشاء جزء من الحبل
    function CreateSegment(parent) {
        var segment = document.createElement("div");
        segment.classList.add("segment");
        segment.style = `
            background: #458dff;
            border: 3px solid #458dff;
            border-radius: 20px;
            width: 100px;
            height: 4px;
            position: absolute;
            top: -2px;
            left: 0;
            pointer-events: none;
        `;
        parent.appendChild(segment);

        return segment;
    }

    // دالة لضبط موضع الأجزاء (الأذرع)
    function SetSegment(segment, p1, p2) {
        var diff = {x: p1.x - p2.x, y: p1.y - p2.y};
        var len = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
        var angle = Math.atan2(diff.y, diff.x);
        segment.style.width = len * 1.2 + "px";
        segment.style.transform = `translateX(${p1.x - diff.x / 2 - len / 2 - 4 / 2}px) translateY(${p1.y - diff.y / 2 - 4 / 2}px) rotate(` + (angle / Math.PI * 180) + "deg)";
    }

    // إنشاء النقاط
    function Point(x, y, isFixed = false) {
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.isFixed = isFixed;

        this.update = function() {
            if (!this.isFixed) {
                this.y += 0.3;
            }

            var velocity = {
                x: this.x - this.oldX,
                y: this.y - this.oldY
            };
            this.oldX = this.x;
            this.oldY = this.y;

            if (!this.isFixed) {
                this.x += velocity.x;
                this.y += velocity.y;
            }
        };
    }

    // إنشاء الأذرع
    function Arm(p1, p2, parent) {
        this.a = p1;
        this.b = p2;
        this.len = getDistance(this.a, this.b);
        this.stiffness = 1;
        this.segmentElement = CreateSegment(parent);

        this.update = function() {
            var distance = getDistance(this.a, this.b);
            var error = this.len - distance;

            var percent = error / distance / 2;
            var offset = {
                x: (this.b.x - this.a.x) * percent * this.stiffness,
                y: (this.b.y - this.a.y) * percent * this.stiffness,
            };

            if (!this.a.isFixed) {
                this.a.x -= offset.x;
                this.a.y -= offset.y;
            }
            if (!this.b.isFixed) {
                this.b.x += offset.x;
                this.b.y += offset.y;
            }
        };

        this.updateElement = function() {
            SetSegment(this.segmentElement, this.a, this.b);
        };
    }

    // حساب المسافة بين نقطتين
    function getDistance(a, b) {
        var x = a.x - b.x;
        var y = a.y - b.y;
        return Math.sqrt(x * x + y * y);
    }

    // خريطة من القيمة
    function map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    loop(); // بدء الحركة
}