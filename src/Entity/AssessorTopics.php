<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * AssessorTopics
 *
 * @ORM\Table(name="Users.Assessor_Topics", indexes={@ORM\Index(name="fk_Assessor_Topics_Content_Assessor1_idx", columns={"Assessor_ID"}), @ORM\Index(name="fk_Assessor_Topics_Dynamic_Topics1_idx", columns={"Topic_ID"})})
 * @ORM\Entity
 */
class AssessorTopics
{
    /**
     * @var string
     *
     * @ORM\Column(name="Affinity", type="decimal", precision=5, scale=4, nullable=true)
     */
    private $affinity;

    /**
     * @var \App\Entity\ContentAssessor
     *
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="NONE")
     * @ORM\OneToOne(targetEntity="App\Entity\ContentAssessor")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Assessor_ID", referencedColumnName="Assessor_ID")
     * })
     */
    private $assessor;

    /**
     * @var \App\Entity\DynamicTopics
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\DynamicTopics")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Topic_ID", referencedColumnName="Topic_ID")
     * })
     */
    private $topic;


    /**
     * Set affinity
     *
     * @param string $affinity
     *
     * @return AssessorTopics
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
     * Set assessor
     *
     * @param \App\Entity\ContentAssessor $assessor
     *
     * @return AssessorTopics
     */
    public function setAssessor(\App\Entity\ContentAssessor $assessor)
    {
        $this->assessor = $assessor;

        return $this;
    }

    /**
     * Get assessor
     *
     * @return \App\Entity\ContentAssessor
     */
    public function getAssessor()
    {
        return $this->assessor;
    }

    /**
     * Set topic
     *
     * @param \App\Entity\DynamicTopics $topic
     *
     * @return AssessorTopics
     */
    public function setTopic(\App\Entity\DynamicTopics $topic = null)
    {
        $this->topic = $topic;

        return $this;
    }

    /**
     * Get topic
     *
     * @return \App\Entity\DynamicTopics
     */
    public function getTopic()
    {
        return $this->topic;
    }
}
