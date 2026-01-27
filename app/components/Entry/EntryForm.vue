<template>
  <form @submit.prevent="handleSave" class="space-y-6">
    <!-- 🆕 Work Items (Projects) -->
    <div>
      <label class="block text-sm font-medium mb-3 text-warm-700 dark:text-cream-200">
        💼 오늘 작업한 프로젝트
      </label>
      
      <!-- 선택된 프로젝트들 -->
      <div v-if="form.workItems.length > 0" class="space-y-3 mb-4">
        <div
          v-for="(workItem, index) in form.workItems"
          :key="workItem.projectId"
          class="p-4 bg-cream-50 dark:bg-warm-800 rounded-2xl border border-cream-200 dark:border-warm-700"
        >
          <!-- 프로젝트 정보 헤더 -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-0.5 bg-lavender-100 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-300 text-xs font-medium rounded-lg">
                  {{ getProjectById(workItem.projectId)?.crew }}
                </span>
                <a 
                  v-if="getProjectById(workItem.projectId)?.jiraLink"
                  :href="getProjectById(workItem.projectId)?.jiraLink"
                  target="_blank"
                  class="text-xs text-lavender-600 dark:text-lavender-400 font-mono hover:underline"
                  @click.stop
                >
                  🎫 {{ extractTicketFromUrl(getProjectById(workItem.projectId)?.jiraLink || '') }}
                </a>
              </div>
              <p class="text-warm-800 dark:text-cream-100 font-medium">
                {{ getProjectById(workItem.projectId)?.title }}
              </p>
              <a 
                v-if="getProjectById(workItem.projectId)?.notionLink"
                :href="getProjectById(workItem.projectId)?.notionLink"
                target="_blank"
                class="text-xs text-lavender-600 dark:text-lavender-400 hover:underline"
              >
                📎 노션 링크
              </a>
            </div>
            <button
              type="button"
              @click="removeWorkItem(index)"
              class="p-1 text-warm-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <!-- 오늘 작업 내용 -->
          <textarea
            v-model="workItem.dailyNote"
            rows="2"
            placeholder="오늘 이 프로젝트에서 한 작업..."
            class="w-full border border-warm-300 dark:border-warm-500 bg-white dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 resize-none transition-all"
          />
        </div>
      </div>
      
      <!-- 프로젝트 선택 드롭다운 -->
      <div class="relative">
        <button
          type="button"
          @click="showProjectSelector = !showProjectSelector"
          class="w-full border-2 border-dashed border-cream-300 dark:border-warm-600 rounded-xl px-4 py-3 text-warm-500 dark:text-warm-400 hover:border-lavender-400 hover:text-lavender-600 dark:hover:text-lavender-400 transition-all text-left"
        >
          + 프로젝트 추가
        </button>
        
        <!-- 프로젝트 선택 팝업 -->
        <div
          v-if="showProjectSelector"
          class="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-warm-800 border border-cream-200 dark:border-warm-600 rounded-2xl shadow-xl overflow-hidden max-h-80 overflow-y-auto"
        >
          <!-- 새 프로젝트 추가 버튼 -->
          <button
            type="button"
            @click="showNewProjectForm = true; showProjectSelector = false"
            class="w-full px-4 py-3 text-left text-lavender-600 dark:text-lavender-400 hover:bg-lavender-50 dark:hover:bg-lavender-900/20 transition-colors border-b border-cream-200 dark:border-warm-600 flex items-center gap-2"
          >
            <span class="text-lg">✨</span>
            <span>새 프로젝트 만들기</span>
          </button>
          
          <!-- 진행 중인 프로젝트 목록 -->
          <div v-if="availableProjects.length > 0">
            <p class="px-4 py-2 text-xs text-warm-500 dark:text-warm-400 bg-cream-50 dark:bg-warm-700">
              진행 중인 프로젝트
            </p>
            <div
              v-for="project in availableProjects"
              :key="project.id"
              class="flex items-center hover:bg-cream-50 dark:hover:bg-warm-700 transition-colors"
            >
              <button
                type="button"
                @click="addWorkItem(project.id)"
                class="flex-1 px-4 py-3 text-left"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 bg-lavender-100 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-300 text-xs font-medium rounded-lg">
                    {{ project.crew }}
                  </span>
                  <span v-if="project.jiraLink" class="text-xs text-warm-500 dark:text-warm-400 font-mono">
                    🎫 {{ extractTicketFromUrl(project.jiraLink) }}
                  </span>
                </div>
                <p class="text-warm-800 dark:text-cream-100 text-sm">{{ project.title }}</p>
              </button>
              <!-- 수정/삭제 버튼 -->
              <div class="flex items-center gap-1 pr-2">
                <button
                  type="button"
                  @click.stop="openEditProject(project)"
                  class="p-2 text-warm-400 hover:text-lavender-600 dark:hover:text-lavender-400 transition-colors"
                  title="수정"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  @click.stop="confirmDeleteProject(project)"
                  class="p-2 text-warm-400 hover:text-red-500 transition-colors"
                  title="삭제"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="px-4 py-6 text-center text-warm-500 dark:text-warm-400">
            <p class="text-sm">진행 중인 프로젝트가 없습니다</p>
            <p class="text-xs mt-1">새 프로젝트를 만들어보세요!</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 🆕 새 프로젝트 추가 모달 -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="showNewProjectForm" 
          class="fixed inset-0 z-[100] flex items-center justify-center p-4"
          @click.self="showNewProjectForm = false"
        >
          <div class="absolute inset-0 bg-warm-900/50 dark:bg-black/60 backdrop-blur-sm" />
          
          <div class="relative bg-white dark:bg-warm-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-in">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-warm-800 dark:text-cream-100 mb-4">
                ✨ 새 프로젝트 추가
              </h3>
              
              <div class="space-y-4">
                <!-- 크루 선택/입력 -->
                <div>
                  <label class="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-2">
                    크루 *
                  </label>
                  <div class="flex gap-2 flex-wrap mb-2">
                    <button
                      v-for="crew in existingCrews"
                      :key="crew"
                      type="button"
                      @click="newProject.crew = crew"
                      :class="[
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        newProject.crew === crew
                          ? 'bg-lavender-500 text-white'
                          : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-lavender-100 dark:hover:bg-lavender-900/30'
                      ]"
                    >
                      {{ crew }}
                    </button>
                  </div>
                  <input
                    v-model="newProject.crew"
                    type="text"
                    placeholder="새 크루명 입력..."
                    class="w-full border border-warm-300 dark:border-warm-500 bg-cream-50 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500"
                  />
                </div>
                
                <!-- 지라 티켓 URL -->
                <div>
                  <label class="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-2">
                    지라 티켓 URL (선택)
                  </label>
                  <input
                    v-model="newProject.jiraLink"
                    type="url"
                    placeholder="https://jira.company.com/browse/KCN-123"
                    class="w-full border border-warm-300 dark:border-warm-500 bg-cream-50 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500"
                  />
                  <p v-if="newProject.jiraLink" class="mt-1 text-xs text-lavender-600 dark:text-lavender-400">
                    표시: 🎫 {{ extractTicketFromUrl(newProject.jiraLink) }}
                  </p>
                </div>
                
                <!-- 작업 제목 -->
                <div>
                  <label class="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-2">
                    작업 제목 *
                  </label>
                  <input
                    v-model="newProject.title"
                    type="text"
                    placeholder="어떤 작업인가요?"
                    class="w-full border border-warm-300 dark:border-warm-500 bg-cream-50 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500"
                  />
                </div>
                
                <!-- 노션 링크 -->
                <div>
                  <label class="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-2">
                    노션 링크 (선택)
                  </label>
                  <input
                    v-model="newProject.notionLink"
                    type="url"
                    placeholder="https://notion.so/..."
                    class="w-full border border-warm-300 dark:border-warm-500 bg-cream-50 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500"
                  />
                </div>
              </div>
              
              <div class="flex gap-3 mt-6">
                <button
                  type="button"
                  @click="showNewProjectForm = false"
                  class="flex-1 px-4 py-3 bg-cream-100 dark:bg-warm-700 text-warm-700 dark:text-cream-200 rounded-2xl font-medium hover:bg-cream-200 dark:hover:bg-warm-600 transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  @click="handleCreateProject"
                  :disabled="!newProject.crew || !newProject.title || isCreatingProject"
                  class="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="isCreatingProject" class="inline-flex items-center gap-2">
                    <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    추가 중...
                  </span>
                  <span v-else>추가</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 🆕 프로젝트 수정 모달 -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="editingProject" 
          class="fixed inset-0 z-[100] flex items-center justify-center p-4"
          @click.self="editingProject = null"
        >
          <div class="absolute inset-0 bg-warm-900/50 dark:bg-black/60 backdrop-blur-sm" />
          
          <div class="relative bg-white dark:bg-warm-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-in">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-warm-800 dark:text-cream-100 mb-4">
                ✏️ 프로젝트 수정
              </h3>
              
              <div class="space-y-4">
                <!-- 크루명 -->
                <div>
                  <label class="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-2">
                    크루명 *
                  </label>
                  <input
                    v-model="editProjectForm.crew"
                    type="text"
                    class="w-full border border-warm-300 dark:border-warm-500 bg-cream-50 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-300"
                  />
                </div>
                
                <!-- 작업 제목 -->
                <div>
                  <label class="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-2">
                    작업 제목 *
                  </label>
                  <input
                    v-model="editProjectForm.title"
                    type="text"
                    class="w-full border border-warm-300 dark:border-warm-500 bg-cream-50 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-300"
                  />
                </div>
                
                <!-- 지라 링크 -->
                <div>
                  <label class="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-2">
                    지라 티켓 URL (선택)
                  </label>
                  <input
                    v-model="editProjectForm.jiraLink"
                    type="url"
                    class="w-full border border-warm-300 dark:border-warm-500 bg-cream-50 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-300"
                  />
                </div>
                
                <!-- 노션 링크 -->
                <div>
                  <label class="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-2">
                    노션 링크 (선택)
                  </label>
                  <input
                    v-model="editProjectForm.notionLink"
                    type="url"
                    class="w-full border border-warm-300 dark:border-warm-500 bg-cream-50 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-300"
                  />
                </div>
              </div>
              
              <div class="flex gap-3 mt-6">
                <button
                  type="button"
                  @click="editingProject = null"
                  class="flex-1 px-4 py-3 bg-cream-100 dark:bg-warm-700 text-warm-700 dark:text-cream-200 rounded-2xl font-medium hover:bg-cream-200 dark:hover:bg-warm-600 transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  @click="handleUpdateProject"
                  :disabled="!editProjectForm.crew || !editProjectForm.title || isUpdatingProject"
                  class="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="isUpdatingProject" class="inline-flex items-center gap-2">
                    <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    저장 중...
                  </span>
                  <span v-else>저장</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 🆕 프로젝트 삭제 확인 모달 -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="deletingProject" 
          class="fixed inset-0 z-[100] flex items-center justify-center p-4"
          @click.self="deletingProject = null"
        >
          <div class="absolute inset-0 bg-warm-900/50 dark:bg-black/60 backdrop-blur-sm" />
          
          <div class="relative bg-white dark:bg-warm-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-modal-in">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-warm-800 dark:text-cream-100 mb-2">
                🗑️ 프로젝트 삭제
              </h3>
              <p class="text-warm-600 dark:text-warm-300 mb-4">
                <strong>{{ deletingProject.title }}</strong>을(를) 삭제할까요?
              </p>
              <p class="text-sm text-red-500 mb-4">이 작업은 되돌릴 수 없어요.</p>
              
              <div class="flex gap-3">
                <button
                  type="button"
                  @click="deletingProject = null"
                  class="flex-1 px-4 py-3 bg-cream-100 dark:bg-warm-700 text-warm-700 dark:text-cream-200 rounded-2xl font-medium hover:bg-cream-200 dark:hover:bg-warm-600 transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  @click="handleDeleteProject"
                  :disabled="isDeletingProject"
                  class="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-medium disabled:opacity-50 transition-colors"
                >
                  <span v-if="isDeletingProject" class="inline-flex items-center gap-2">
                    <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    삭제 중...
                  </span>
                  <span v-else>삭제</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Events -->
    <div>
      <label for="events" class="block text-sm font-medium mb-3 text-warm-700 dark:text-cream-200">
        🎉 오늘의 이벤트 (선택)
      </label>
      <textarea
        id="events"
        v-model="form.eventsText"
        rows="3"
        class="w-full border border-warm-300 dark:border-warm-500 bg-cream-100 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 resize-none transition-all"
        placeholder="특별한 이벤트나 일정을 입력하세요..."
      />
    </div>

    <!-- Mood -->
    <div>
      <label class="block text-sm font-medium mb-3 text-warm-700 dark:text-cream-200">
        😊 오늘의 기분
      </label>
      
      <!-- Emoji Mood Picker -->
      <div class="flex justify-center gap-2 md:gap-3 mb-3">
        <button
          v-for="mood in moodOptions"
          :key="mood.value"
          type="button"
          :class="[
            'text-2xl p-2 rounded-xl transition-all duration-200',
            form.mood.value === mood.value 
              ? 'bg-lavender-200 dark:bg-lavender-800/60 ring-2 ring-lavender-500 dark:ring-lavender-400 scale-110 shadow-md' 
              : 'hover:bg-cream-100 dark:hover:bg-warm-700 hover:scale-105'
          ]"
          :aria-label="mood.label"
          :title="mood.label"
          @click="handleMoodSelect(mood.value)"
        >
          {{ mood.emoji }}
        </button>
      </div>
      
      <!-- Selected Mood Label -->
      <p 
        v-if="selectedMoodLabel" 
        class="text-center text-lavender-600 dark:text-lavender-400 font-medium text-sm mb-3"
      >
        {{ selectedMoodLabel }}
      </p>
      
      <!-- Mood Reason -->
      <div class="mt-4">
        <label class="block text-sm text-warm-500 dark:text-warm-400 mb-2">
          {{ selectedMoodLabel ? `왜 "${selectedMoodLabel}" 인가요?` : '기분을 더 자세히 적어보세요' }} 💭
        </label>
        <textarea
          v-model="form.mood.note"
          rows="3"
          :placeholder="form.mood.value ? '무슨 일이 있었나요? 어떤 감정이 드나요?' : '위에서 기분을 먼저 선택해주세요...'"
          class="w-full border border-warm-300 dark:border-warm-500 bg-cream-100 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 resize-none transition-all"
        />
      </div>
    </div>

    <!-- People -->
    <div>
      <label class="block text-sm font-medium mb-3 text-warm-700 dark:text-cream-200">
        👥 함께한 사람
      </label>
      <div class="space-y-3">
        <div
          v-for="(person, index) in form.people"
          :key="index"
          class="p-4 bg-cream-50 dark:bg-warm-800 rounded-2xl space-y-3 border border-cream-100 dark:border-warm-700"
        >
          <div class="flex gap-2">
            <div class="flex-1 relative">
              <input
                :value="person.name"
                type="text"
                placeholder="이름을 입력하세요"
                @input="handlePersonInput($event, index)"
                @focus="handlePersonFocus(index)"
                @blur="handlePersonBlur"
                class="w-full border border-warm-300 dark:border-warm-500 bg-white dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 transition-all"
              />
              <!-- Autocomplete Suggestions -->
              <div
                v-if="focusedPersonIndex === index && personSuggestions.length > 0"
                class="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-warm-700 border border-warm-300 dark:border-warm-500 rounded-xl shadow-lg overflow-hidden"
              >
                <button
                  v-for="suggestion in personSuggestions"
                  :key="suggestion"
                  type="button"
                  @mousedown.prevent="selectSuggestion(suggestion)"
                  class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-lavender-50 dark:hover:bg-lavender-900/20 transition-colors"
                >
                  <img
                    :src="getAvatarUrl(suggestion, 'lorelei')"
                    :alt="suggestion"
                    class="w-7 h-7 rounded-full bg-cream-100 dark:bg-warm-600"
                  />
                  <span class="text-warm-700 dark:text-cream-100">{{ suggestion }}</span>
                </button>
              </div>
            </div>
            <!-- Custom Mood Dropdown -->
            <div class="relative">
              <button
                type="button"
                @click="togglePersonMoodDropdown(index)"
                class="w-14 h-12 border border-warm-300 dark:border-warm-500 bg-white dark:bg-warm-700 rounded-xl flex items-center justify-center text-xl hover:bg-cream-50 dark:hover:bg-warm-600 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 transition-all"
                :class="person.mood ? 'ring-2 ring-lavender-400 dark:ring-lavender-500 bg-lavender-50 dark:bg-lavender-900/30' : ''"
                :aria-label="person.mood ? getPersonMoodLabel(person.mood) : '기분 선택'"
              >
                <span v-if="person.mood">{{ getPersonMoodEmoji(person.mood) }}</span>
                <span v-else class="text-warm-400 dark:text-warm-500">😶</span>
              </button>
              
              <!-- Dropdown Menu -->
              <div
                v-if="openPersonMoodIndex === index"
                class="absolute z-50 top-full right-0 mt-2 bg-white dark:bg-warm-700 border border-warm-300 dark:border-warm-500 rounded-xl shadow-lg p-2"
              >
                <div class="flex gap-1">
                  <button
                    v-for="mood in personMoodOptions"
                    :key="mood.value"
                    type="button"
                    @click="selectPersonMood(index, mood.value)"
                    :class="[
                      'text-xl p-2 rounded-lg transition-all duration-200',
                      person.mood === mood.value 
                        ? 'bg-lavender-200 dark:bg-lavender-800/60 ring-2 ring-lavender-500 dark:ring-lavender-400 scale-110' 
                        : 'hover:bg-cream-100 dark:hover:bg-warm-600 hover:scale-105'
                    ]"
                    :aria-label="mood.label"
                    :title="mood.label"
                  >
                    {{ mood.emoji }}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              @click="removePerson(index)"
              class="px-3 py-2 text-warm-400 dark:text-warm-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            >
              ✕
            </button>
          </div>
          <input
            v-model="person.feeling"
            type="text"
            placeholder="함께한 순간에 대한 메모 (선택)"
            class="w-full border border-warm-300 dark:border-warm-500 bg-white dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 text-sm transition-all"
          />
        </div>
        <button
          type="button"
          @click="addPerson"
          class="w-full border-2 border-dashed border-cream-300 dark:border-warm-600 rounded-xl px-4 py-3 text-warm-500 dark:text-warm-400 hover:border-lavender-400 hover:text-lavender-600 dark:hover:text-lavender-400 transition-all"
        >
          + 사람 추가
        </button>
      </div>
    </div>

    <!-- Tomorrow -->
    <div>
      <label for="tomorrow" class="block text-sm font-medium mb-3 text-warm-700 dark:text-cream-200">
        🌅 내일의 다짐 (선택)
      </label>
      <textarea
        id="tomorrow"
        v-model="form.tomorrow"
        rows="3"
        class="w-full border border-warm-300 dark:border-warm-500 bg-cream-100 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 resize-none transition-all"
        placeholder="내일의 계획이나 목표를 입력하세요..."
      />
    </div>

    <!-- Actions -->
    <div class="flex gap-3 pt-2">
      <button
        type="submit"
        :disabled="isSaving"
        class="flex-1 btn-primary py-4 text-base disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span v-if="isSaving" class="inline-flex items-center gap-2">
          <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          저장 중...
        </span>
        <span v-else>✨ 저장하기</span>
      </button>
      <button
        v-if="hasExistingEntry"
        type="button"
        :disabled="isSaving"
        @click="handleDelete"
        class="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        삭제
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Mood, MoodValue, WorkItem, Project } from '~/types'
import { useEntriesStore } from '~/stores/entries'
import { useProjectsStore } from '~/stores/projects'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import { getAvatarUrl } from '~/shared/utils/avatar'

const entriesStore = useEntriesStore()
const projectsStore = useProjectsStore()

// Mood options with emojis
const moodOptions = [
  { value: 'great' as const, emoji: '😄', label: '최고예요!' },
  { value: 'good' as const, emoji: '🙂', label: '좋아요' },
  { value: 'okay' as const, emoji: '😐', label: '그냥 그래요' },
  { value: 'bad' as const, emoji: '😔', label: '별로예요' },
  { value: 'awful' as const, emoji: '😢', label: '힘들어요' },
]

// Person mood options (same as main mood but for people)
const personMoodOptions = [
  { value: 'great' as const, emoji: '😊', label: '최고' },
  { value: 'good' as const, emoji: '🙂', label: '좋음' },
  { value: 'okay' as const, emoji: '😐', label: '보통' },
  { value: 'bad' as const, emoji: '😕', label: '나쁨' },
  { value: 'awful' as const, emoji: '😢', label: '최악' },
]

// State for person mood dropdown
const openPersonMoodIndex = ref<number | null>(null)

const togglePersonMoodDropdown = (index: number): void => {
  if (openPersonMoodIndex.value === index) {
    openPersonMoodIndex.value = null
  } else {
    openPersonMoodIndex.value = index
  }
}

const selectPersonMood = (index: number, moodValue: string): void => {
  if (form.value.people[index]) {
    form.value.people[index].mood = moodValue
  }
  openPersonMoodIndex.value = null
}

const getPersonMoodEmoji = (moodValue: string): string => {
  const mood = personMoodOptions.find(m => m.value === moodValue)
  return mood ? mood.emoji : '😶'
}

const getPersonMoodLabel = (moodValue: string): string => {
  const mood = personMoodOptions.find(m => m.value === moodValue)
  return mood ? mood.label : '기분'
}

// Click outside handler to close dropdowns
const handleClickOutside = (event: MouseEvent): void => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    openPersonMoodIndex.value = null
    showProjectSelector.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const props = defineProps<{
  date: string
  initialEntry?: {
    bullets: string[]
    events?: string[]
    mood: Mood
    people: Array<{ name: string; feeling?: string; mood?: MoodValue }> | string[]
    tomorrow?: string
    workItems?: WorkItem[]
  }
  hasExistingEntry?: boolean
  isSaving?: boolean
}>()

const emit = defineEmits<{
  save: [data: {
    bullets: string[]
    events?: string[]
    mood: Mood
    people: Array<{ name: string; feeling?: string; mood?: MoodValue }>
    tomorrow?: string
    workItems?: WorkItem[]
  }]
  delete: []
}>()

// 🆕 프로젝트 관련 상태
const showProjectSelector = ref(false)
const showNewProjectForm = ref(false)
const isCreatingProject = ref(false)

// 🆕 프로젝트 수정/삭제 관련 상태
const editingProject = ref<Project | null>(null)
const deletingProject = ref<Project | null>(null)
const isUpdatingProject = ref(false)
const isDeletingProject = ref(false)

const editProjectForm = ref({
  crew: '',
  title: '',
  jiraLink: '',
  notionLink: '',
})

// 모달 열릴 때 배경 스크롤 막기
const isAnyModalOpen = computed(() => showNewProjectForm.value || !!editingProject.value || !!deletingProject.value)
useBodyScrollLock(isAnyModalOpen)

const newProject = ref({
  crew: '',
  jiraLink: '',
  title: '',
  notionLink: '',
})

// 프로젝트 수정 모달 열기
const openEditProject = (project: Project): void => {
  editingProject.value = project
  editProjectForm.value = {
    crew: project.crew,
    title: project.title,
    jiraLink: project.jiraLink || '',
    notionLink: project.notionLink || '',
  }
  showProjectSelector.value = false
}

// 프로젝트 삭제 확인
const confirmDeleteProject = (project: Project): void => {
  deletingProject.value = project
  showProjectSelector.value = false
}

// 프로젝트 수정 저장
const handleUpdateProject = async (): Promise<void> => {
  if (!editingProject.value) return
  if (!editProjectForm.value.crew.trim() || !editProjectForm.value.title.trim()) return
  
  isUpdatingProject.value = true
  try {
    await projectsStore.updateProject(editingProject.value.id, {
      crew: editProjectForm.value.crew.trim(),
      title: editProjectForm.value.title.trim(),
      jiraLink: editProjectForm.value.jiraLink.trim() || undefined,
      notionLink: editProjectForm.value.notionLink.trim() || undefined,
    })
    editingProject.value = null
  } finally {
    isUpdatingProject.value = false
  }
}

// 프로젝트 삭제 실행
const handleDeleteProject = async (): Promise<void> => {
  if (!deletingProject.value) return
  
  isDeletingProject.value = true
  try {
    await projectsStore.deleteProject(deletingProject.value.id)
    deletingProject.value = null
  } finally {
    isDeletingProject.value = false
  }
}

// URL에서 티켓 번호 추출 (마지막 / 뒤의 텍스트)
const extractTicketFromUrl = (url: string): string => {
  if (!url) return ''
  try {
    const cleanUrl = url.replace(/\/+$/, '') // 끝의 슬래시 제거
    const parts = cleanUrl.split('/')
    return parts[parts.length - 1] || ''
  } catch {
    return ''
  }
}

// 기존 크루 목록
const existingCrews = computed(() => projectsStore.uniqueCrews)

// 선택 가능한 프로젝트 (같은 프로젝트도 여러 번 추가 가능)
const availableProjects = computed(() => {
  return projectsStore.activeProjects
})

// 프로젝트 ID로 프로젝트 찾기
const getProjectById = (id: string): Project | undefined => {
  return projectsStore.getProjectById(id)
}

// 작업 항목 추가
const addWorkItem = (projectId: string): void => {
  form.value.workItems.push({
    projectId,
    dailyNote: '',
  })
  showProjectSelector.value = false
}

// 작업 항목 제거
const removeWorkItem = (index: number): void => {
  form.value.workItems.splice(index, 1)
}

// 새 프로젝트 생성
const handleCreateProject = async (): Promise<void> => {
  if (!newProject.value.crew || !newProject.value.title) return
  
  isCreatingProject.value = true
  
  const created = await projectsStore.createProject({
    crew: newProject.value.crew,
    jiraLink: newProject.value.jiraLink || undefined,
    title: newProject.value.title,
    notionLink: newProject.value.notionLink || undefined,
    status: 'active',
  })
  
  if (created) {
    // 생성된 프로젝트를 바로 작업 항목에 추가
    addWorkItem(created.id)
    
    // 폼 초기화
    newProject.value = {
      crew: '',
      jiraLink: '',
      title: '',
      notionLink: '',
    }
    showNewProjectForm.value = false
  }
  
  isCreatingProject.value = false
}

const form = ref({
  bullets: props.initialEntry?.bullets && props.initialEntry.bullets.length > 0
    ? [...props.initialEntry.bullets]
    : [''],
  eventsText: props.initialEntry?.events?.join('\n') || '',
  mood: {
    value: (props.initialEntry?.mood.value || 'okay') as Mood['value'],
    note: props.initialEntry?.mood.note || '',
  },
  people: props.initialEntry?.people.map((p) => ({
    name: typeof p === 'string' ? p : p.name,
    feeling: typeof p === 'string' ? '' : (p.feeling || ''),
    mood: typeof p === 'string' ? '' : (p.mood || ''),
  })) || [],
  tomorrow: props.initialEntry?.tomorrow || '',
  workItems: props.initialEntry?.workItems?.map(w => ({ ...w })) || [],
})

const selectedMoodLabel = computed(() => {
  const mood = moodOptions.find(m => m.value === form.value.mood.value)
  return mood ? mood.label : ''
})

const handleMoodSelect = (moodValue: MoodValue): void => {
  form.value.mood.value = moodValue
}

// 기존에 기록된 모든 사람 이름 목록 (고유)
const allPeopleNames = computed(() => {
  const allEntries = entriesStore.listEntries()
  const names = new Set<string>()
  
  allEntries.forEach((entry) => {
    entry.people.forEach((person) => {
      const name = typeof person === 'string' ? person : person.name
      if (name && name.trim()) {
        names.add(name.trim())
      }
    })
  })
  
  return Array.from(names).sort()
})

// 현재 focus된 사람 input의 index
const focusedPersonIndex = ref<number | null>(null)

// 현재 실시간 입력값 (한글 조합 중에도 반영)
const currentInputValue = ref('')

// 현재 입력 중인 이름에 대한 suggestions
const personSuggestions = computed(() => {
  if (focusedPersonIndex.value === null) return []
  
  const currentName = currentInputValue.value
  if (!currentName.trim()) return allPeopleNames.value.slice(0, 5) // 빈 입력이면 최근 5명 보여줌
  
  const trimmedName = currentName.trim()
  return allPeopleNames.value
    .filter((name) => name.startsWith(trimmedName) && name !== trimmedName)
    .slice(0, 5)
})

function handlePersonFocus(index: number) {
  focusedPersonIndex.value = index
  currentInputValue.value = form.value.people[index]?.name || ''
}

function handlePersonInput(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  currentInputValue.value = target.value
  if (form.value.people[index]) {
    form.value.people[index].name = target.value
  }
}

function handlePersonBlur() {
  // 약간의 지연을 줘서 suggestion 클릭이 먼저 처리되도록
  setTimeout(() => {
    focusedPersonIndex.value = null
    currentInputValue.value = ''
  }, 200)
}

function selectSuggestion(name: string) {
  const idx = focusedPersonIndex.value
  if (idx !== null) {
    const person = form.value.people[idx]
    if (person) {
      person.name = name
      currentInputValue.value = ''
      focusedPersonIndex.value = null
    }
  }
}

function parseEvents(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function addPerson() {
  form.value.people.push({ name: '', feeling: '', mood: '' })
}

function removePerson(index: number) {
  form.value.people.splice(index, 1)
}

function handleSave() {
  // Notes 개수 체크
  const validBullets = form.value.bullets
    .map((b) => b.trim())
    .filter((b) => b.length > 0)
    .slice(0, 10)
  
  if (form.value.bullets.filter((b) => b.trim().length > 0).length > 10) {
    alert('Notes는 최대 10개까지 저장할 수 있습니다. 초과된 항목은 제외됩니다.')
  }

  const events = parseEvents(form.value.eventsText)
  const people = form.value.people
    .filter((p) => p.name.trim().length > 0)
    .map((p) => ({
      name: p.name.trim(),
      feeling: p.feeling.trim() || undefined,
      mood: (p.mood as MoodValue) || undefined,
    }))

  // 🆕 작업 항목 정리
  const workItems = form.value.workItems
    .filter((w) => w.projectId)
    .map((w) => ({
      projectId: w.projectId,
      dailyNote: w.dailyNote?.trim() || undefined,
    }))

  emit('save', {
    bullets: validBullets,
    events: events.length > 0 ? events : undefined,
    mood: {
      value: form.value.mood.value,
      note: form.value.mood.note || undefined,
    },
    people,
    tomorrow: form.value.tomorrow || undefined,
    workItems: workItems.length > 0 ? workItems : undefined,
  })
}

function handleDelete() {
  if (confirm('정말 삭제하시겠습니까?')) {
    emit('delete')
  }
}
</script>

