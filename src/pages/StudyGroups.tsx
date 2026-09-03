import { useState, useEffect } from 'react';
import { Plus, Search, Copy, Users, LogOut, Check } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, SectionTitle, Button, Input, Tag, EmptyState, Modal } from '@/components/ui';
import type { StudyGroup, GroupMember } from '@/lib/supabase';

const groupIcons = ['📚', '⚡', '🧬', '📐', '🎯', '🔥', '⭐', '🚀', '💡', '🏆'];

export function StudyGroups() {
  const { user, studyGroups, myGroups, createGroup, joinGroup, leaveGroup, getGroupMembers, showToast } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  // Create form state
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupIcon, setGroupIcon] = useState('📚');
  const [creating, setCreating] = useState(false);
  const [createdCode, setCreatedCode] = useState('');

  // Join form state
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  const filtered = studyGroups.filter(
    (g) => g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!groupName.trim()) {
      showToast('Please enter a group name', 'red');
      return;
    }
    setCreating(true);
    const result = await createGroup(groupName.trim(), groupDesc.trim(), groupIcon);
    setCreating(false);
    if (result.success && result.accessCode) {
      setCreatedCode(result.accessCode);
      showToast(`Group created! Access code: ${result.accessCode}`, 'green');
      setGroupName('');
      setGroupDesc('');
      setGroupIcon('📚');
    } else {
      showToast(result.error || 'Failed to create group', 'red');
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      showToast('Please enter an access code', 'red');
      return;
    }
    setJoining(true);
    const result = await joinGroup(joinCode.trim());
    setJoining(false);
    if (result.success) {
      showToast(`Joined "${result.group?.name}" successfully!`, 'green');
      setJoinCode('');
      setShowJoin(false);
    } else {
      showToast(result.error || 'Failed to join group', 'red');
    }
  };

  const openGroup = async (group: StudyGroup) => {
    setSelectedGroup(group);
    const m = await getGroupMembers(group.id);
    setMembers(m);
  };

  const handleLeave = async (groupId: string) => {
    await leaveGroup(groupId);
    showToast('Left the group', 'orange');
    setSelectedGroup(null);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast('Access code copied to clipboard', 'teal');
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--text-primary)' }}>Study Groups</div>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>Create groups, share access codes, and study together</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={() => setShowJoin(true)}>
            Join by Code
          </Button>
          <Button variant="gold" size="sm" onClick={() => { setShowCreate(true); setCreatedCode(''); }}>
            <Plus size={14} /> Create Group
          </Button>
        </div>
      </div>

      {/* My Groups */}
      {myGroups.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionTitle>My Groups ({myGroups.length})</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myGroups.map((g) => (
              <GroupCard key={g.id} group={g} isMember onOpen={() => openGroup(g)} onLeave={() => handleLeave(g.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Discover */}
      <SectionTitle>Discover Groups</SectionTitle>
      <div style={{ marginBottom: 16 }}>
        <Input value={search} onChange={setSearch} placeholder="Search groups by name or description..." />
      </div>
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon="⬡"
            title={search ? "No groups found" : "No groups yet"}
            sub={search ? "Try a different search term." : "Be the first to create a study group and invite others with an access code."}
            action={!search ? <Button variant="gold" size="sm" onClick={() => setShowCreate(true)}>Create the first group →</Button> : undefined}
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              isMember={myGroups.some((mg) => mg.id === g.id)}
              onOpen={() => openGroup(g)}
              onLeave={() => handleLeave(g.id)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Study Group">
        {createdCode ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Group Created!</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Share this access code with others so they can join your group:</div>
            <div
              onClick={() => copyCode(createdCode)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 32px',
                background: 'var(--gold-glow)',
                border: '2px dashed var(--gold)',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                marginBottom: 20,
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.15em' }}>
                {createdCode}
              </span>
              {copiedCode ? <Check size={18} style={{ color: 'var(--green)' }} /> : <Copy size={18} style={{ color: 'var(--text-muted)' }} />}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Click the code to copy it to your clipboard.</div>
            <Button variant="gold" onClick={() => setShowCreate(false)}>Done</Button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>GROUP NAME</div>
              <Input value={groupName} onChange={setGroupName} placeholder="e.g. JEE 2026 Warriors" onEnter={handleCreate} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>DESCRIPTION</div>
              <Input value={groupDesc} onChange={setGroupDesc} placeholder="What's this group about?" onEnter={handleCreate} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>GROUP ICON</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {groupIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setGroupIcon(icon)}
                    style={{
                      width: 44,
                      height: 44,
                      border: groupIcon === icon ? '2px solid var(--gold)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      background: groupIcon === icon ? 'var(--gold-glow)' : 'var(--bg-panel)',
                      cursor: 'pointer',
                      fontSize: 20,
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="gold" onClick={handleCreate} disabled={creating || !groupName.trim()}>
                {creating ? 'Creating...' : 'Create Group'}
              </Button>
              <Button onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </>
        )}
      </Modal>

      {/* Join Modal */}
      <Modal open={showJoin} onClose={() => setShowJoin(false)} title="Join a Group">
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          Enter the 6-character access code shared by the group creator.
        </div>
        <Input
          value={joinCode}
          onChange={setJoinCode}
          placeholder="e.g. AB3X9K"
          onEnter={handleJoin}
          style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 20, letterSpacing: '0.2em', textTransform: 'uppercase' }}
        />
        <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
          <Button variant="gold" onClick={handleJoin} disabled={joining || !joinCode.trim()}>
            {joining ? 'Joining...' : 'Join Group'}
          </Button>
          <Button onClick={() => setShowJoin(false)}>Cancel</Button>
        </div>
      </Modal>

      {/* Group Detail Modal */}
      <Modal open={!!selectedGroup} onClose={() => setSelectedGroup(null)} title={selectedGroup?.name}>
        {selectedGroup && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', background: 'var(--gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                {selectedGroup.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedGroup.description || 'No description provided'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Created by {selectedGroup.creator_name} on {new Date(selectedGroup.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Access code */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>ACCESS CODE</div>
              <div
                onClick={() => copyCode(selectedGroup.access_code)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 24px',
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.15em' }}>
                  {selectedGroup.access_code}
                </span>
                {copiedCode ? <Check size={16} style={{ color: 'var(--green)' }} /> : <Copy size={16} style={{ color: 'var(--text-muted)' }} />}
              </div>
            </div>

            {/* Members */}
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>
                MEMBERS ({members.length})
              </div>
              {members.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 0' }}>No members yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {members.map((m) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                        {m.member_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                          {m.member_name}{m.member_email === user.email ? ' (You)' : ''}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {m.member_email}{m.member_phone ? ` · ${m.member_phone}` : ''}
                        </div>
                      </div>
                      {m.member_email === selectedGroup.creator_name ? <Tag color="gold">Creator</Tag> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {myGroups.some((mg) => mg.id === selectedGroup.id) && (
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="ghost" size="sm" onClick={() => handleLeave(selectedGroup.id)} style={{ color: 'var(--red)', borderColor: 'var(--red)' }}>
                  <LogOut size={14} /> Leave Group
                </Button>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

function GroupCard({ group, isMember, onOpen, onLeave }: { group: StudyGroup; isMember: boolean; onOpen: () => void; onLeave: () => void }) {
  return (
    <Card style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }} onClick={onOpen}>
      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: 'var(--gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {group.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{group.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {group.description || 'No description'} · Created by {group.creator_name}
        </div>
      </div>
      {isMember ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Tag color="teal">Joined</Tag>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onLeave(); }} style={{ color: 'var(--red)', fontSize: 11 }}>
            Leave
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
          View →
        </Button>
      )}
    </Card>
  );
}
