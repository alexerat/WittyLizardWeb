<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * TopicParents
 *
 * @ORM\Table(name="Users.Topic_Parents",
 * indexes={@ORM\Index(name="fk_Topic_Parents_Dynamic_Topics1_idx", columns={"Parent_ID"}), @ORM\Index(name="fk_Topic_Parents_Dynamic_Topics2_idx", columns={"Child_ID"})})
 * @ORM\Entity
 */
class TopicParents
{
    /**
     * @var \App\Entity\DynamicTopics
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\DynamicTopics")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Parent_ID", referencedColumnName="Topic_ID")
     * })
     * @ORM\Id
     */
    protected $parentId;

    /**
     * @var \App\Entity\DynamicTopics
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\DynamicTopics")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Child_ID", referencedColumnName="Topic_ID")
     * })
     * @ORM\Id
     */
    protected $childId;

    /**
     * @var float
     *
     * @ORM\Column(name="Affinity", type="decimal", scale=4)
     */
    protected $affinity;

    /**
     * Set affinity
     *
     * @param string $affinity
     *
     * @return TopicParents
     */
    public function setAffinity($affinity)
    {
        $this->affinity = $affinity;

        return $this;
    }

    /**
     * Get affinity
     *
     * @return string
     */
    public function getAffinity()
    {
        return $this->affinity;
    }

    /**
     * Set parentId
     *
     * @param \App\Entity\DynamicTopics $parentId
     *
     * @return TopicParents
     */
    public function setParentId(\App\Entity\DynamicTopics $parentId = null)
    {
        $this->parentId = $parentId;

        return $this;
    }

    /**
     * Get parentId
     *
     * @return \App\Entity\DynamicTopics
     */
    public function getParentId()
    {
        return $this->parentId;
    }

    /**
     * Set childId
     *
     * @param \App\Entity\DynamicTopics $childId
     *
     * @return TopicParents
     */
    public function setChildId(\App\Entity\DynamicTopics $childId = null)
    {
        $this->childId = $childId;

        return $this;
    }

    /**
     * Get childId
     *
     * @return \App\Entity\DynamicTopics
     */
    public function getChildId()
    {
        return $this->childId;
    }
}
