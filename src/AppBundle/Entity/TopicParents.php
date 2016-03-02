<?php

namespace AppBundle\Entity;

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
     * @var \AppBundle\Entity\DynamicTopics
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\DynamicTopics")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Parent_ID", referencedColumnName="Topic_ID")
     * })
     * @ORM\Id
     */
    protected $parentId;

    /**
     * @var \AppBundle\Entity\DynamicTopics
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\DynamicTopics")
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
     * @param \AppBundle\Entity\DynamicTopics $parentId
     *
     * @return TopicParents
     */
    public function setParentId(\AppBundle\Entity\DynamicTopics $parentId = null)
    {
        $this->parentId = $parentId;

        return $this;
    }

    /**
     * Get parentId
     *
     * @return \AppBundle\Entity\DynamicTopics
     */
    public function getParentId()
    {
        return $this->parentId;
    }

    /**
     * Set childId
     *
     * @param \AppBundle\Entity\DynamicTopics $childId
     *
     * @return TopicParents
     */
    public function setChildId(\AppBundle\Entity\DynamicTopics $childId = null)
    {
        $this->childId = $childId;

        return $this;
    }

    /**
     * Get childId
     *
     * @return \AppBundle\Entity\DynamicTopics
     */
    public function getChildId()
    {
        return $this->childId;
    }
}
