function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.getElementById(pageId).scrollTop = 0;
}

const orderItems = { 
  brookie: 0, 
  ubeCoconut: 0,
  ubeCheese: 0
};


function changeToppingQty(topping, change) {
    const maxQty = orderItems.ube; // limit toppings to number of Ube cakes
    const currentTotal = ubeToppings["Cheese"] + ubeToppings["Coconut Flakes"];

    // Prevent exceeding Ube qty
    if (change > 0 && currentTotal >= maxQty) return;

    ubeToppings[topping] = Math.max(0, ubeToppings[topping] + change);
    document.getElementById(`topping-${topping}`).textContent = ubeToppings[topping];
}

function changeQty(item, change) {
    orderItems[item] = Math.max(0, orderItems[item] + change);
    document.getElementById('qty-' + item).textContent = orderItems[item];
    const itemElement = document.querySelector('[data-item="' + item + '"]');
    if (orderItems[item] > 0) {
        if (item === 'ube') {
    const totalToppings = ubeToppings["Cheese"] + ubeToppings["Coconut Flakes"];
    if (totalToppings > orderItems.ube) {
        // If we reduced Ube qty, also reduce toppings automatically
        ubeToppings["Cheese"] = 0;
        ubeToppings["Coconut Flakes"] = 0;
        document.getElementById('topping-Cheese').textContent = '0';
        document.getElementById('topping-Coconut Flakes').textContent = '0';
    }
}
        itemElement.classList.add('selected');
    } else {
        itemElement.classList.remove('selected');
    }
}

const pickupRadio = document.getElementById('pickup');
const deliveryRadio = document.getElementById('delivery');
const addressGroup = document.getElementById('addressGroup');
const addressField = document.getElementById('address');

function toggleAddressField() {
    if (deliveryRadio.checked) {
        addressGroup.style.display = 'block';
        addressField.required = true;
    } else {
        addressGroup.style.display = 'none';
        addressField.required = false;
    }
}

pickupRadio.addEventListener('change', function() {
    toggleAddressField();
    document.getElementById('date').value = '';
    document.getElementById('timeSlotGroup').style.display = 'none';
    selectedTimeSlot = null;
    deliveryFee = 0;
    deliveryArea = '';
});

deliveryRadio.addEventListener('change', function() {
    toggleAddressField();
    document.getElementById('date').value = '';
    document.getElementById('timeSlotGroup').style.display = 'none';
    selectedTimeSlot = null;
    deliveryFee = 0;
    deliveryArea = '';
});

const bookedSlots = {};
let selectedTimeSlot = null;
let deliveryFee = 0;
let deliveryArea = '';

const scheduleConfig = {
    pickup: {
        days: [2, 4],
        startTime: 2.5,
        endTime: 4.75,
        duration: 15,
        label: 'Pick-up'
    },
    delivery: {
        saturday: {
            day: 6,
            startTime: 2.5,
            endTime: 5.5,
            duration: 30,
            area: 'Eau Claire',
            fee: 6.50
        },
        sunday: {
            day: 0,
            startTime: 2.5,
            endTime: 5,
            duration: 30,
            area: 'Mondovi',
            fee: 2
        }
    }
};

function generateTimeSlots(startTime, endTime, durationMinutes) {
    const slots = [];
    let current = startTime;
    const durationHours = durationMinutes / 60;
    
    while (current + durationHours <= endTime) {
        const hours = Math.floor(current);
        const minutes = Math.round((current - hours) * 60);
        const timeString = String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
        slots.push(timeString);
        current += durationHours;
    }
    
    return slots;
}

function loadTimeSlots() {
    const dateInput = document.getElementById('date');
    const selectedDate = dateInput.value;
    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked');
    
    if (!selectedDate) {
        document.getElementById('timeSlotGroup').style.display = 'none';
        return;
    }
    
    if (!deliveryMethod) {
        document.getElementById('timeSlotGroup').style.display = 'none';
        alert('Please select a delivery method first (Pick-up or Delivery)');
        return;
    }
    
    const date = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = date.getDay();
    
    const selectorDiv = document.getElementById('timeSlotSelector');
    selectorDiv.innerHTML = '';
    
    const existingInfo = selectorDiv.parentElement.querySelector('.schedule-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    selectedTimeSlot = null;
    deliveryFee = 0;
    deliveryArea = '';
    
    let availableSlots = [];
    let dayLabel = '';
    
    if (deliveryMethod.value === 'pickup') {
        if (scheduleConfig.pickup.days.includes(dayOfWeek)) {
            availableSlots = generateTimeSlots(
                scheduleConfig.pickup.startTime,
                scheduleConfig.pickup.endTime,
                scheduleConfig.pickup.duration
            );
            dayLabel = scheduleConfig.pickup.label;
        } else {
            document.getElementById('timeSlotGroup').style.display = 'block';
            selectorDiv.innerHTML = '<p style="color: #ff6b6b; padding: 15px; text-align: center;">Pick-up is only available on Tuesdays and Thursdays (2:30 PM - 4:30 PM). Please select a different date.</p>';
            return;
        }
    } else if (deliveryMethod.value === 'delivery') {
        if (dayOfWeek === scheduleConfig.delivery.saturday.day) {
            availableSlots = generateTimeSlots(
                scheduleConfig.delivery.saturday.startTime,
                scheduleConfig.delivery.saturday.endTime,
                scheduleConfig.delivery.saturday.duration
            );
            deliveryArea = scheduleConfig.delivery.saturday.area;
            deliveryFee = scheduleConfig.delivery.saturday.fee;
            dayLabel = 'Delivery - ' + deliveryArea + ' Area (+$' + deliveryFee + ')';
        } else if (dayOfWeek === scheduleConfig.delivery.sunday.day) {
            availableSlots = generateTimeSlots(
                scheduleConfig.delivery.sunday.startTime,
                scheduleConfig.delivery.sunday.endTime,
                scheduleConfig.delivery.sunday.duration
            );
            deliveryArea = scheduleConfig.delivery.sunday.area;
            deliveryFee = scheduleConfig.delivery.sunday.fee;
            dayLabel = 'Delivery - ' + deliveryArea + ' Area (+$' + deliveryFee + ')';
        } else {
            document.getElementById('timeSlotGroup').style.display = 'block';
            selectorDiv.innerHTML = '<p style="color: #ff6b6b; padding: 15px; text-align: center;">Delivery is only available on:<br>• Saturday (Eau Claire area) 2:30 PM - 5:00 PM<br>• Sunday (Mondovi area) 2:30 PM - 4:30 PM<br>Please select a different date.</p>';
            return;
        }
    }
    
    if (availableSlots.length > 0) {
        document.getElementById('timeSlotGroup').style.display = 'block';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'schedule-info';
        infoDiv.style.cssText = 'background: #e8f5e9; padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: center; color: #2e7d32; font-weight: bold;';
        infoDiv.textContent = dayLabel;
        selectorDiv.parentElement.insertBefore(infoDiv, selectorDiv);
        
        const bookedTimes = bookedSlots[selectedDate] || [];
        availableSlots.forEach(time => {
            const slotDiv = document.createElement('div');
            slotDiv.className = 'time-slot';
            slotDiv.textContent = time;
            if (bookedTimes.includes(time)) {
                slotDiv.classList.add('taken');
                slotDiv.title = 'This time slot is already booked';
            } else {
                slotDiv.onclick = () => selectTimeSlot(time, slotDiv, selectedDate);
            }
            selectorDiv.appendChild(slotDiv);
        });
    }
}

function selectTimeSlot(time, element, date) {
    document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
    element.classList.add('selected');
    selectedTimeSlot = time;
    document.getElementById('timeError').style.display = 'none';
}

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyATroGMImbN8AB9kjegRMi-pyfjBKrDxSiSVTjacedcA0DePEq1hbe4JDr1bMrbTU7Aw/exec';

document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const totalItems = orderItems.brookie + orderItems.ube;
    if (totalItems === 0) {
        document.getElementById('orderError').style.display = 'block';
        return;
    }
    if (orderItems.ube > 0) {
    const totalToppings = ubeToppings["Cheese"] + ubeToppings["Coconut Flakes"];
    if (totalToppings !== orderItems.ube) {
        document.getElementById('toppingError').style.display = 'block';
        return;
    }
}
    document.getElementById('orderError').style.display = 'none';
    if (!selectedTimeSlot) {
        document.getElementById('timeError').style.display = 'block';
        return;
    }
    document.getElementById('timeError').style.display = 'none';
    
    const formData = new FormData(e.target);
    const selectedDate = formData.get('date');
    
    if (!bookedSlots[selectedDate]) {
        bookedSlots[selectedDate] = [];
    }
    bookedSlots[selectedDate].push(selectedTimeSlot);
    
    const subtotal = 
        orderItems.brookie * 2.99 +
        orderItems.ubeCoconut * 5.50 +
        orderItems.ubeCheese * 5.50;
    const total = (subtotal + deliveryFee).toFixed(2);
    const subtotalFormatted = subtotal.toFixed(2);
    
    let itemList = '';
        if (orderItems.brookie > 0) itemList += `Brookie Monsters x${orderItems.brookie}, `;
        if (orderItems.ubeCoconut > 0) itemList += `Ube Dream Tres Leches (Coconut Flakes) x${orderItems.ubeCoconut}, `;
        if (orderItems.ubeCheese > 0) itemList += `Ube Dream Tres Leches (Cheese) x${orderItems.ubeCheese}`;
    
    const orderData = {
        timestamp: new Date().toISOString(),
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        deliveryMethod: formData.get('deliveryMethod') === 'pickup' ? 'Pick-up' : 'Delivery',
        deliveryArea: deliveryArea || 'N/A',
        address: formData.get('address') || 'N/A',
        brookieQty: orderItems.brookie,
        ubeCoconutQty: orderItems.ubeCoconut,
        ubeCheeseQty: orderItems.ubeCheese,
        items: itemList,
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        total: total,
        date: selectedDate,
        time: selectedTimeSlot,
        specialRequests: formData.get('specialRequests') || 'None'
        };


    // ✅ Move topping summary logic **after** orderData is declared
    let successMessage = 'Thank you for your order! 🎉\n\nOrder Summary:\n';
    successMessage += 'Name: ' + orderData.fullName + '\n';
    successMessage += 'Items: ' + itemList + '\n';
    if (orderItems.ube > 0) {
        successMessage += 'Toppings:\n';
        if (ubeToppings["Cheese"] > 0) successMessage += `• Cheese x${ubeToppings["Cheese"]}\n`;
        if (ubeToppings["Coconut Flakes"] > 0) successMessage += `• Coconut Flakes x${ubeToppings["Coconut Flakes"]}\n`;
    }
    successMessage += 'Subtotal: $' + subtotalFormatted + '\n';
    if (deliveryFee > 0) {
        successMessage += 'Delivery Fee (' + deliveryArea + '): $' + deliveryFee.toFixed(2) + '\n';
    }
    successMessage += 'Total: $' + total + '\n';
    successMessage += 'Method: ' + orderData.deliveryMethod;
    if (deliveryArea) {
        successMessage += ' (' + deliveryArea + ' Area)';
    }
    successMessage += '\nDate: ' + selectedDate + '\n';
    successMessage += 'Time: ' + selectedTimeSlot + '\n\n';
    successMessage += 'Your order has been submitted! We will contact you shortly to confirm. ✨';

    
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting... ⏳';
    
    console.log('Sending order data:', orderData);
    console.log('To URL:', SCRIPT_URL);
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(orderData)
        });
        
        console.log('Request sent successfully (no-cors mode)');
        
        let successMessage = 'Thank you for your order! 🎉\n\nOrder Summary:\n';
        successMessage += 'Name: ' + orderData.fullName + '\n';
        successMessage += 'Items: ' + itemList + '\n';
        successMessage += 'Subtotal: $' + subtotalFormatted + '\n';
        if (deliveryFee > 0) {
            successMessage += 'Delivery Fee (' + deliveryArea + '): $' + deliveryFee.toFixed(2) + '\n';
        }
        successMessage += 'Total: $' + total + '\n';
        successMessage += 'Method: ' + orderData.deliveryMethod;
        if (deliveryArea) {
            successMessage += ' (' + deliveryArea + ' Area)';
        }
        successMessage += '\nDate: ' + selectedDate + '\n';
        successMessage += 'Time: ' + selectedTimeSlot + '\n\n';
        successMessage += 'Your order has been submitted! We will contact you shortly to confirm. ✨';
        
        alert(successMessage);
        
        resetForm();
        
    } catch (error) {
        console.error('Submission error:', error);
        alert('⚠️ There was an error submitting your order.\n\nError: ' + error.message + '\n\nPlease try again or contact us directly:\n\nOrder Details:\n' + 
            'Name: ' + orderData.fullName + '\n' +
            'Email: ' + orderData.email + '\n' +
            'Phone: ' + orderData.phone + '\n' +
            'Items: ' + itemList + '\n' +
            'Total: $' + total);
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Order ✨';
    }
});

function resetForm() {
    document.getElementById('orderForm').reset();
    orderItems.brookie = 0;
    orderItems.ubeCoconut = 0;
    orderItems.ubeCheese = 0;
    document.getElementById('qty-brookie').textContent = '0';
    document.getElementById('qty-ubeCoconut').textContent = '0';
    document.getElementById('qty-ubeCheese').textContent = '0';
    document.querySelectorAll('.menu-select-item').forEach(item => item.classList.remove('selected'));
    document.getElementById('timeSlotGroup').style.display = 'none';
    addressGroup.style.display = 'none';
    deliveryFee = 0;
    deliveryArea = '';
    selectedTimeSlot = null;
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Order ✨';
}

window.addEventListener('load', () => {
  const intro = document.getElementById('intro');
  const introVideo = document.getElementById('introVideo');

  introVideo.addEventListener('ended', () => {
    intro.classList.add('slide-up');
    setTimeout(() => {
      intro.style.display = 'none';
      document.getElementById('home-page').classList.add('active');
    }, 1500); // same as CSS transition
  });
});
