/**
 * CampThread – Unified Create Post form with category-specific fields
 */
(function () {
  const typeLabels = { ride: 'Ride', task: 'Task', maintenance: 'Maintenance', post: 'Post / News' };

  function typeFields(type) {
    if (type === 'post') {
      return `
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Title</label>
          <input type="text" name="postTitle" placeholder="e.g. Free pizza in the lounge!" class="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">What's happening?</label>
          <textarea name="postContent" rows="4" placeholder="Share news, something funny, or whatever's on your mind..." class="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white"></textarea>
        </div>
      `;
    }
    if (type === 'ride') {
      return `
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Destination</label>
            <input type="text" name="destination" placeholder="e.g. Downtown" class="w-full px-3 py-2 rounded-lg border border-neutral-200" />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Date & time</label>
            <input type="datetime-local" name="dateTime" class="w-full px-3 py-2 rounded-lg border border-neutral-200" />
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Available seats</label>
            <input type="number" name="seats" min="1" placeholder="2" class="w-full px-3 py-2 rounded-lg border border-neutral-200" />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Price split ($)</label>
            <input type="number" name="priceSplit" min="0" step="0.01" placeholder="10" class="w-full px-3 py-2 rounded-lg border border-neutral-200" />
          </div>
        </div>
      `;
    }
    if (type === 'task') {
      return `
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Description</label>
          <textarea name="description" rows="3" placeholder="What do you need help with?" class="w-full px-3 py-2 rounded-lg border border-neutral-200"></textarea>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Category</label>
            <select name="category" class="w-full px-3 py-2 rounded-lg border border-neutral-200">
              <option value="">Select...</option>
              <option value="Tutoring">Tutoring</option>
              <option value="Moving">Moving</option>
              <option value="Tech">Tech</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Estimated effort</label>
            <input type="text" name="estimatedEffort" placeholder="e.g. 1 hour" class="w-full px-3 py-2 rounded-lg border border-neutral-200" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Compensation (optional)</label>
          <input type="text" name="compensation" placeholder="e.g. $20 or free lunch" class="w-full px-3 py-2 rounded-lg border border-neutral-200" />
        </div>
      `;
    }
    if (type === 'maintenance') {
      return `
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Location / Building</label>
          <input type="text" name="location" placeholder="e.g. Dorm A, Room 101" class="w-full px-3 py-2 rounded-lg border border-neutral-200" />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Issue description</label>
          <textarea name="issueDescription" rows="3" placeholder="Describe the issue..." class="w-full px-3 py-2 rounded-lg border border-neutral-200"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Urgency</label>
          <select name="urgency" class="w-full px-3 py-2 rounded-lg border border-neutral-200">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">Photo (optional)</label>
          <input type="file" name="photo" accept="image/*" class="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm" />
          <p class="text-xs text-neutral-400 mt-1">Upload a photo of the issue</p>
        </div>
      `;
    }
    return '';
  }

  function getDefaultStatus(type) {
    if (type === 'ride') return 'open';
    if (type === 'task') return 'open';
    if (type === 'maintenance') return 'reported';
    if (type === 'post') return 'posted';
    return 'open';
  }

  function collectPayload(form, type) {
    const fd = new FormData(form);
    const payload = { type, status: getDefaultStatus(type) };
    if (type === 'post') {
      payload.title = fd.get('postTitle') || '';
      payload.content = fd.get('postContent') || '';
    } else if (type === 'ride') {
      payload.destination = fd.get('destination') || '';
      payload.dateTime = fd.get('dateTime') || '';
      payload.seats = fd.get('seats') ? parseInt(fd.get('seats'), 10) : null;
      payload.priceSplit = fd.get('priceSplit') ? parseFloat(fd.get('priceSplit')) : null;
      payload.title = payload.destination ? 'Ride to ' + payload.destination : 'Ride share';
    } else if (type === 'task') {
      payload.description = fd.get('description') || '';
      payload.category = fd.get('category') || '';
      payload.estimatedEffort = fd.get('estimatedEffort') || '';
      payload.compensation = fd.get('compensation') || '';
      payload.title = (payload.description || '').slice(0, 60) + (payload.description && payload.description.length > 60 ? '…' : '');
    } else if (type === 'maintenance') {
      payload.location = fd.get('location') || '';
      payload.issueDescription = fd.get('issueDescription') || '';
      payload.urgency = fd.get('urgency') || 'Medium';
      payload.title = payload.location || payload.issueDescription?.slice(0, 40) || 'Maintenance';
      const file = fd.get('photo');
      payload.photoUrl = null;
      if (file && file.size) {
        const reader = new FileReader();
        reader.onload = function () { payload.photoUrl = reader.result; };
        reader.readAsDataURL(file);
      }
    }
    return payload;
  }

  function render() {
    const container = document.getElementById('view-create');
    if (!container) return;
    let selectedType = 'post';
    container.innerHTML = `
      <div class="app-card p-6 md:p-8 fade-in-up delay-0 bg-white dark:bg-neutral-800">
        <h2 class="text-xl font-bold text-neutral-800 dark:text-white mb-6">Create Post</h2>
        <form id="create-post-form" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Post type</label>
            <div class="flex gap-2 flex-wrap">
              ${['post', 'ride', 'task', 'maintenance'].map((t) => `
                <button type="button" class="create-type-btn px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedType === t ? 'bg-[#1A1A1A] dark:bg-neutral-600 text-white' : 'bg-[#F4F4F4] dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600'}" data-type="${t}">${typeLabels[t]}</button>
              `).join('')}
            </div>
          </div>
          <div id="create-type-fields" class="space-y-4 border-t border-neutral-200 pt-6">
            ${typeFields(selectedType)}
          </div>
          <div class="flex gap-3 pt-4">
            <button type="submit" class="px-4 py-2.5 rounded-xl font-medium text-white bg-[#2D7A3A] hover:opacity-90 transition-opacity duration-200">Publish</button>
            <a href="#feed" class="px-4 py-2.5 rounded-xl font-medium text-neutral-600 bg-[#F4F4F4] hover:bg-neutral-200 transition-colors duration-200">Cancel</a>
          </div>
        </form>
      </div>
    `;
    const typeFieldsEl = container.querySelector('#create-type-fields');
    container.querySelectorAll('.create-type-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        selectedType = this.getAttribute('data-type');
        container.querySelectorAll('.create-type-btn').forEach((b) => {
          b.classList.remove('bg-[#1A1A1A]', 'text-white');
          b.classList.add('bg-[#F4F4F4]', 'text-neutral-700');
        });
        this.classList.add('bg-[#1A1A1A]', 'text-white');
        this.classList.remove('bg-[#F4F4F4]');
        typeFieldsEl.innerHTML = typeFields(selectedType);
      });
    });
    container.querySelector('#create-post-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const payload = collectPayload(this, selectedType);
      const fileInput = this.querySelector('input[name="photo"]');
      const file = fileInput && fileInput.files && fileInput.files[0];
      if (selectedType === 'maintenance' && file) {
        const reader = new FileReader();
        reader.onload = function () {
          payload.photoUrl = reader.result;
          CampThread.addPost(payload);
          window.location.hash = 'feed';
        };
        reader.readAsDataURL(file);
      } else {
        CampThread.addPost(payload);
        window.location.hash = 'feed';
      }
    });
  }

  window.CampThreadCreatePost = { render };
})();
