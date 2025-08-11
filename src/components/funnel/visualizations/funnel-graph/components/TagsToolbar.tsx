import React from 'react';
import { Tag as TagIcon, Check } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const TagsToolbar: React.FC = () => {
  const [availableTags, setAvailableTags] = React.useState<string[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [isCreateTagOpen, setIsCreateTagOpen] = React.useState(false);
  const [newTagName, setNewTagName] = React.useState('');
  const [tagsSelectOpen, setTagsSelectOpen] = React.useState(false);

  const handleAddTag = (tag: string) => {
    if (!tag) return;
    if (tag === '__create_new__') {
      setTagsSelectOpen(false);
      setIsCreateTagOpen(true);
      return;
    }
    setSelectedTags(prev => (prev.includes(tag) ? prev : [...prev, tag]));
  };

  const handleCreateTag = () => {
    const name = newTagName.trim();
    if (!name) return;
    setAvailableTags(prev => (prev.includes(name) ? prev : [...prev, name]));
    setNewTagName('');
    setIsCreateTagOpen(false);
    setTagsSelectOpen(true);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderBottom: '1px solid #e2e8f0',
      background: 'rgba(255,255,255,0.9)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <TagIcon size={16} className="text-slate-600" />
        <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Tags</span>
      </div>
      <div style={{ marginLeft: 'auto', minWidth: 260 }}>
        <Select open={tagsSelectOpen} onOpenChange={setTagsSelectOpen} onValueChange={handleAddTag}>
          <SelectTrigger className="h-9">
            <div className="flex items-center gap-2 overflow-hidden">
              <TagIcon size={14} className="text-slate-500" />
              {selectedTags.length > 0 ? (
                <span className="truncate text-sm text-slate-700">
                  {selectedTags.slice(0, 2).join(', ')}
                  {selectedTags.length > 2 ? ` +${selectedTags.length - 2}` : ''}
                </span>
              ) : (
                <span className="text-slate-500 text-sm">Add tag</span>
              )}
              <SelectValue className="sr-only" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {availableTags.length === 0 && (
              <div className="p-3 text-xs text-slate-600 w-64">
                <div className="mb-2">No tags yet.</div>
                <Button size="sm" className="mt-1" onClick={(e) => { e.preventDefault(); setIsCreateTagOpen(true); setTagsSelectOpen(false); }}>
                  Create tag
                </Button>
              </div>
            )}
            {availableTags.length > 0 && (
              <SelectGroup>
                {selectedTags.length > 0 && (
                  <>
                    <SelectLabel>Selected</SelectLabel>
                    {selectedTags.map(tag => (
                      <SelectItem key={`sel-${tag}`} value={tag}>
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{tag}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectSeparator />
                  </>
                )}
                <SelectLabel>Available</SelectLabel>
                {availableTags
                  .filter(t => !selectedTags.includes(t))
                  .map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                {availableTags.filter(t => !selectedTags.includes(t)).length === 0 && (
                  <div className="px-2 py-1.5 text-xs text-slate-500">All tags are selected</div>
                )}
                <SelectSeparator />
                <SelectItem value="__create_new__">+ Create new tag…</SelectItem>
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isCreateTagOpen} onOpenChange={setIsCreateTagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new tag</DialogTitle>
            <DialogDescription>Give your tag a short, descriptive name.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              autoFocus
              placeholder="e.g. High intent"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTagOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TagsToolbar;


